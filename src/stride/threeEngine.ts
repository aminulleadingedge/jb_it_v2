import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BAR_ASPECT_H, FLAVOURS, type Flavour } from './data';
import { drawCardBackingTexture, drawCutoutTexture, loadImageAsset } from './hardwareArtwork';
import { type BarPose } from './math';

export interface BarInstance {
  group: THREE.Group;
  cardMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
  frontMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
  backMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
  shadowMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  flavourIndex: number;
  slotIndex: number;
  visible: boolean;
}

interface FlavourTextures {
  card: THREE.CanvasTexture;
  front: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
}

export function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

const PLATE_W = 1.24;
const GLASS_PLATE_OPACITY = 1.0;
const PRODUCT_PLANE_Z_OFFSET = 0.008;

function createUnitGeometries(): {
  cardGeo: THREE.PlaneGeometry;
  frontGeo: THREE.PlaneGeometry;
  backGeo: THREE.PlaneGeometry;
} {
  const cardGeo = new THREE.PlaneGeometry(PLATE_W, BAR_ASPECT_H, 1, 1);

  const frontGeo = new THREE.PlaneGeometry(PLATE_W, BAR_ASPECT_H, 1, 1);
  frontGeo.translate(0, 0, PRODUCT_PLANE_Z_OFFSET);

  const backGeo = new THREE.PlaneGeometry(PLATE_W, BAR_ASPECT_H, 1, 1);
  backGeo.rotateY(Math.PI);
  backGeo.translate(0, 0, -PRODUCT_PLANE_Z_OFFSET);

  return { cardGeo, frontGeo, backGeo };
}

function createShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.04,
    size * 0.5,
    size * 0.5,
    size * 0.48,
  );
  grad.addColorStop(0, 'rgba(30, 18, 40, 0.48)');
  grad.addColorStop(0.55, 'rgba(30, 18, 40, 0.2)');
  grad.addColorStop(1, 'rgba(30, 18, 40, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildFlavourTextures(
  flavour: Flavour,
  anisotropy: number,
  productImg: HTMLImageElement | null,
): FlavourTextures {
  const baseW = 512;
  const W = Math.round(baseW * PLATE_W);
  const H = Math.round(baseW * BAR_ASPECT_H);

  const cCanvas = document.createElement('canvas');
  cCanvas.width = W;
  cCanvas.height = H;
  const cCtx = cCanvas.getContext('2d')!;
  drawCardBackingTexture(cCtx, W, H, flavour);
  const card = new THREE.CanvasTexture(cCanvas);
  card.colorSpace = THREE.SRGBColorSpace;
  card.anisotropy = anisotropy;

  const fCanvas = document.createElement('canvas');
  fCanvas.width = W;
  fCanvas.height = H;
  const fCtx = fCanvas.getContext('2d')!;
  drawCutoutTexture(fCtx, W, H, flavour, productImg, false);
  const front = new THREE.CanvasTexture(fCanvas);
  front.colorSpace = THREE.SRGBColorSpace;
  front.anisotropy = anisotropy;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = W;
  bCanvas.height = H;
  const bCtx = bCanvas.getContext('2d')!;
  drawCutoutTexture(bCtx, W, H, flavour, productImg, false);
  const back = new THREE.CanvasTexture(bCanvas);
  back.colorSpace = THREE.SRGBColorSpace;
  back.anisotropy = anisotropy;

  return { card, front, back };
}

export class StrideThreeEngine {
  public readonly canvas: HTMLCanvasElement;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly isSoftwareGl: boolean;

  private readonly cardGeo: THREE.PlaneGeometry;
  private readonly frontGeo: THREE.PlaneGeometry;
  private readonly backGeo: THREE.PlaneGeometry;
  private readonly shadowGeo: THREE.PlaneGeometry;
  private readonly shadowTex: THREE.CanvasTexture;
  private readonly pmremTex: THREE.Texture;

  private readonly poolBars: BarInstance[] = [];
  public readonly travellerBar: BarInstance;
  private readonly allBars: BarInstance[] = [];
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2();

  private flavourTextures: FlavourTextures[] = [];
  private ready = false;
  private disposed = false;

  constructor(onReady?: () => void) {
    this.isSoftwareGl = detectSoftwareWebGL();
    if (this.isSoftwareGl) {
      document.documentElement.classList.add('swgl');
    }

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'gl';
    this.canvas.setAttribute('data-testid', 'jbit-webgl');
    this.canvas.setAttribute('aria-hidden', 'true');
    Object.assign(this.canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: `${window.innerHeight}px`,
      zIndex: '2',
      pointerEvents: 'none',
    });
    document.body.prepend(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 10, 10000);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.pmremTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.pmremTex;
    pmrem.dispose();

    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 0.92);
    key.position.set(-0.6, 0.9, 1.4);
    this.scene.add(key);

    const { cardGeo, frontGeo, backGeo } = createUnitGeometries();
    this.cardGeo = cardGeo;
    this.frontGeo = frontGeo;
    this.backGeo = backGeo;
    this.shadowGeo = new THREE.PlaneGeometry(1.36, 0.94 * BAR_ASPECT_H);
    this.shadowTex = createShadowTexture();

    for (let i = 0; i < 11; i++) {
      const bar = this.createBarInstance();
      this.poolBars.push(bar);
      this.allBars.push(bar);
    }
    this.travellerBar = this.createBarInstance();
    this.allBars.push(this.travellerBar);

    this.resize(window.innerWidth, window.innerHeight);

    this.loadAssets().then(() => {
      if (!this.disposed) {
        this.ready = true;
        onReady?.();
      }
    });
  }

  private createBarInstance(): BarInstance {
    // Double-sided color-matched rounded glass plane at z = 0 behind flat product cutouts
    const cardMat = new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      roughness: 0.12,
      metalness: 0.04,
      ior: 1.5,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.2,
    });
    const cardMesh = new THREE.Mesh(this.cardGeo, cardMat);
    cardMesh.renderOrder = 0;

    // Flat alpha-cutout planes so product images stay crisp and un-tinted on the glass surface
    const makeProductPlaneMat = () =>
      new THREE.MeshPhysicalMaterial({
        transparent: true,
        alphaTest: 0.14,
        roughness: 0.48,
        metalness: 0.04,
        clearcoat: 0.25,
        clearcoatRoughness: 0.18,
        envMapIntensity: 0.3,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });

    const frontMesh = new THREE.Mesh(this.frontGeo, makeProductPlaneMat());
    frontMesh.renderOrder = 1;
    const backMesh = new THREE.Mesh(this.backGeo, makeProductPlaneMat());
    backMesh.renderOrder = 1;
    const group = new THREE.Group();
    group.rotation.order = 'ZYX';
    group.visible = false;
    group.add(cardMesh, frontMesh, backMesh);
    this.scene.add(group);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    const shadowMesh = new THREE.Mesh(this.shadowGeo, shadowMat);
    shadowMesh.renderOrder = -1;
    shadowMesh.visible = false;
    this.scene.add(shadowMesh);

    return {
      group,
      cardMesh,
      frontMesh,
      backMesh,
      shadowMesh,
      flavourIndex: -1,
      slotIndex: 0,
      visible: false,
    };
  }

  private async loadAssets(): Promise<void> {
    const [productImgs] = await Promise.all([
      Promise.all(FLAVOURS.map((f) => loadImageAsset(f.imageUrl))),
      Promise.all([
        document.fonts.load('400 100px "Archivo Black"'),
        document.fonts.load('400 16px "DM Mono"'),
        document.fonts.load('500 16px "DM Mono"'),
        document.fonts.load('700 16px "Inter"'),
        document.fonts.load('800 16px "Inter"'),
      ]).catch(() => undefined),
    ]);

    if (this.disposed) return;
    const anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.flavourTextures = FLAVOURS.map((flav, i) =>
      buildFlavourTextures(flav, anisotropy, productImgs[i] ?? null),
    );
  }

  public isReady(): boolean {
    return this.ready && this.flavourTextures.length === FLAVOURS.length;
  }

  public resize(vw: number, vh: number): void {
    const dpr = this.isSoftwareGl
      ? 1
      : Math.min(window.devicePixelRatio || 1, vw < 820 ? 1.75 : 2);
    this.canvas.style.height = `${vh}px`;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(vw, vh, false);

    const s = Math.min(vw / 1440, vh / 900);
    const D = Math.min(2200, Math.max(1000, 1500 * s));
    const fovRad = 2 * Math.atan(vh / 2 / D);
    this.camera.fov = THREE.MathUtils.radToDeg(fovRad);
    this.camera.aspect = vw / Math.max(1, vh);
    this.camera.near = 10;
    this.camera.far = 4 * D;
    this.camera.position.set(0, 0, D);
    this.camera.updateProjectionMatrix();
  }

  public getPoolBar(poolIndex: number): BarInstance {
    return this.poolBars[poolIndex];
  }

  public hidePoolBar(poolIndex: number): void {
    const bar = this.poolBars[poolIndex];
    bar.group.visible = false;
    bar.shadowMesh.visible = false;
    bar.visible = false;
  }

  public placeBar(
    bar: BarInstance,
    flavourIndex: number,
    slotIndex: number,
    pose: BarPose,
    vw: number,
    vh: number,
    cardAlpha = 1,
  ): void {
    if (!this.isReady() || pose.op <= 0.01) {
      bar.group.visible = false;
      bar.shadowMesh.visible = false;
      bar.visible = false;
      return;
    }

    if (bar.flavourIndex !== flavourIndex) {
      const tex = this.flavourTextures[flavourIndex];
      bar.cardMesh.material.map = tex.card;
      bar.cardMesh.material.needsUpdate = true;
      bar.frontMesh.material.map = tex.front;
      bar.frontMesh.material.needsUpdate = true;
      bar.backMesh.material.map = tex.back;
      bar.backMesh.material.needsUpdate = true;
      bar.flavourIndex = flavourIndex;
    }
    bar.slotIndex = slotIndex;
    bar.visible = true;

    const scale = pose.h / BAR_ASPECT_H;
    const wx = pose.x - vw * 0.5;
    const wy = vh * 0.5 - pose.y;
    const wz = pose.z;

    bar.group.visible = true;
    bar.group.position.set(wx, wy, wz);
    bar.group.scale.set(scale * pose.sx, scale * pose.sy, scale);

    const rx = THREE.MathUtils.degToRad(pose.rx);
    const ry = THREE.MathUtils.degToRad(pose.ry);
    const rz = THREE.MathUtils.degToRad(-pose.rz);
    bar.group.rotation.set(rx, ry, rz, 'ZYX');

    // Render color-matched glass-like backing plane and flat front/back product texture planes
    const resolvedCardOpacity = pose.op * cardAlpha;
    const glassOpacity = resolvedCardOpacity * GLASS_PLATE_OPACITY;
    bar.cardMesh.visible = glassOpacity > 0.02;
    bar.cardMesh.material.opacity = glassOpacity;
    bar.cardMesh.material.depthWrite = false;

    bar.frontMesh.position.set(0, 0, 0);
    bar.backMesh.position.set(0, 0, 0);
    bar.frontMesh.material.opacity = pose.op;
    bar.backMesh.material.opacity = pose.op;

    const shadowOpacity = 0.5 * pose.op * pose.shadow;
    if (shadowOpacity <= 0.01) {
      bar.shadowMesh.visible = false;
    } else {
      bar.shadowMesh.visible = true;
      bar.shadowMesh.position.set(wx, wy - 0.05 * pose.h, wz - 0.32 * pose.h);
      bar.shadowMesh.rotation.set(0, 0, rz);
      const widthScale = Math.max(0.3, Math.abs(Math.cos(ry)));
      bar.shadowMesh.scale.set(scale * widthScale * pose.sx, scale * pose.sy, 1);
      bar.shadowMesh.material.opacity = shadowOpacity;
    }
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public afterDraw(cb: () => void): number {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (typeof gl.fenceSync !== 'function') {
      return window.setTimeout(cb, 80);
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    let timerId = 0;
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        timerId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        timerId = window.setTimeout(cb, 80);
      }
    };
    timerId = window.setTimeout(poll, 5);
    return timerId;
  }

  public raycastHeroBar(clientX: number, clientY: number, vw: number, vh: number): number | null {
    if (!this.isReady()) return null;
    this.pointerNdc.x = (clientX / vw) * 2 - 1;
    this.pointerNdc.y = -(clientY / vh) * 2 + 1;
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);

    const targets: THREE.Object3D[] = [];
    for (const bar of this.allBars) {
      if (bar.visible && bar.group.visible) {
        targets.push(bar.frontMesh, bar.backMesh);
      }
    }
    if (targets.length === 0) return null;
    const hits = this.raycaster.intersectObjects(targets, false);
    if (hits.length === 0) return null;

    const hitMesh = hits[0].object;
    for (const bar of this.allBars) {
      if (bar.frontMesh === hitMesh || bar.backMesh === hitMesh) {
        return bar.slotIndex;
      }
    }
    return null;
  }

  public dispose(): void {
    this.disposed = true;
    this.cardGeo.dispose();
    this.frontGeo.dispose();
    this.backGeo.dispose();
    this.shadowGeo.dispose();
    this.shadowTex.dispose();
    this.pmremTex.dispose();
    for (const ft of this.flavourTextures) {
      ft.card.dispose();
      ft.front.dispose();
      ft.back.dispose();
    }
    for (const bar of this.allBars) {
      bar.cardMesh.material.dispose();
      bar.frontMesh.material.dispose();
      bar.backMesh.material.dispose();
      bar.shadowMesh.material.dispose();
    }
    this.renderer.dispose();
    this.canvas.remove();
  }
}
