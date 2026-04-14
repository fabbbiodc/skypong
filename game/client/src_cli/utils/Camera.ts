import {
  FreeCamera,
  Mesh,
  Vector3,
  Engine,
  Animation,
  CubicEase,
} from "@babylonjs/core";
import { CAMERA } from "../config";

export function animateCameraIntro(
  camera: FreeCamera,
  cameraView: "angled" | "top-down",
  isPlayer2: boolean,
  onComplete: () => void,
): void {
  const isTopDown = cameraView === "top-down";
  const startPosition = isTopDown
    ? CAMERA.INTRO_START_POSITION_TOP_DOWN.clone()
    : CAMERA.INTRO_START_POSITION.clone();

  if (isPlayer2 && !isTopDown) {
    startPosition.z = -startPosition.z;
  }

  const targetPosition = camera.position.clone();

  camera.position = startPosition;

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(CubicEase.EASINGMODE_EASEOUT);

  const positionAnimation = new Animation(
    "cameraIntro",
    "position",
    60,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );

  const keys = [
    { frame: 0, value: camera.position.clone() },
    { frame: 90, value: targetPosition },
  ];

  positionAnimation.setKeys(keys);
  positionAnimation.setEasingFunction(easingFunction);

  camera.animations = [positionAnimation];

  camera.getScene().beginAnimation(camera, 0, 90, false, 1, onComplete);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatTime(ms: number): string {
  const rawSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(rawSeconds / 60);
  const seconds = Math.floor(rawSeconds % 60);

  const minStr = minutes.toString().padStart(2, "0");
  const secStr = seconds.toString().padStart(2, "0");

  return `${minStr}:${secStr}`;
}

export function adjustCamera(camera: FreeCamera, mesh: Mesh, engine: Engine) {
  const boundingInfo = mesh.getBoundingInfo();
  const corners = boundingInfo.boundingBox.vectorsWorld;
  const center = boundingInfo.boundingBox.centerWorld;

  const forward = camera.getForwardRay().direction.normalize();
  const refUp = camera.upVector;
  const right = Vector3.Cross(refUp, forward).normalize();
  const up = Vector3.Cross(forward, right).normalize();

  const fov = camera.fov;
  const aspectRatio = engine.getAspectRatio(camera);

  const tanVFov = Math.tan(fov / 2);
  const tanHFov = tanVFov * aspectRatio;

  let requiredDistance = 0;

  corners.forEach((corner) => {
    const vecToCorner = corner.subtract(center);

    const vDist = Math.abs(Vector3.Dot(vecToCorner, up));
    const hDist = Math.abs(Vector3.Dot(vecToCorner, right));
    const dOffset = Vector3.Dot(vecToCorner, forward);

    const distV = vDist / tanVFov - dOffset;
    const distH = hDist / tanHFov - dOffset;

    requiredDistance = Math.max(requiredDistance, distV, distH);
  });

  requiredDistance *= CAMERA.MARGIN;

  camera.position = center.subtract(forward.scale(requiredDistance));
  camera.attachControl();
}
