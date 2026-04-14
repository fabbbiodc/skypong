import { Scene, Texture, PBRMaterial, Color3, RenderTargetTexture } from "@babylonjs/core";
import { IMaterialOptions } from "../config/Materials";

export class MaterialFactory {
    private static _loadTexture(
        scene: Scene,
        folder: string,
        matName: string,
        suffix: string,
        u: number,
        v: number,
        isLinear: boolean = false
    ): Texture {
        const jpgPath = `${folder}${matName}_${suffix}.jpg`;
        const pngPath = `${folder}${matName}_${suffix}.png`;

        const tex = new Texture(
            jpgPath,
            scene,
            false,
            true,
            Texture.TRILINEAR_SAMPLINGMODE,
            null,
            () => {
                if (tex.url && tex.url.endsWith(".jpg")) {
                    console.warn(
                        `Fallback: ${suffix} not found as JPG, trying PNG.`
                    );
                    tex.updateURL(pngPath);
                }
            }
        );

        tex.uScale = u;
        tex.vScale = v;
        if (isLinear) tex.gammaSpace = false;

        return tex;
    }

    public static CreatePBRMaterial(
        scene: Scene,
        matName: string,
        options?: IMaterialOptions
    ): PBRMaterial {
        const material = new PBRMaterial(`${matName}PBR`, scene);

        if (scene.environmentTexture) {
            material.reflectionTexture = scene.environmentTexture;
        }
        material.forceIrradianceInFragment = true;

        const u = options?.uScale ?? options?.uvScale ?? 1.0;
        const v = options?.vScale ?? options?.uvScale ?? 1.0;
        const folder = options?.folderPath ?? `./textures/${matName}/`;

        material.albedoColor = options?.albedoColor ?? new Color3(1, 1, 1);

        if (!options?.albedoColor) {
            material.albedoTexture = this._loadTexture(
                scene,
                folder,
                matName,
                "albedo",
                u,
                v
            );
        }

        const normalStr = options?.normalLevel ?? 0;
        if (normalStr > 0) {
            material.bumpTexture = this._loadTexture(
                scene,
                folder,
                matName,
                "nor",
                u,
                v,
                true
            );
            material.bumpTexture.level = normalStr;
            material.invertNormalMapX = true;
            material.invertNormalMapY = true;
        }

        const useOrm = options?.useOrm === true;

        if (useOrm) {
            material.metallicTexture = this._loadTexture(
                scene,
                folder,
                matName,
                "orm",
                u,
                v,
                true
            );
            material.useRoughnessFromMetallicTextureGreen = true;
            material.useMetallnessFromMetallicTextureBlue = true;
            material.useAmbientOcclusionFromMetallicTextureRed =
                options?.useAoMap ?? true;
            material.metallic = options?.pbrMetallic ?? 1.0;
            material.roughness = options?.pbrRoughness ?? 1.0;
        } else {
            material.metallic = options?.pbrMetallic ?? 0.0;
            material.roughness = options?.pbrRoughness ?? 0.8;
        }

        if (options?.isRefractive) {
            material.subSurface.isRefractionEnabled = true;
            material.subSurface.refractionIntensity = options.refractionIntensity ?? 1.0;
            material.subSurface.indexOfRefraction = options.indexOfRefraction ?? 1.5;
            material.subSurface.linkRefractionWithTransparency =
                options.linkRefractionWithTransparency ?? true;
            material.subSurface.tintColor = options.tintColor ?? new Color3(0.95, 0.95, 0.95);
            material.subSurface.tintColorAtDistance = options.tintColorAtDistance ?? 1.0;
            material.alpha = options.alpha ?? 0.1;
            material.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
            material.backFaceCulling = !(options.doubleSided ?? false);
            material.needDepthPrePass = false;
            material.separateCullingPass = true;

            const refractionTexture = new RenderTargetTexture(
                `${matName}_refraction`,
                512,
                scene,
                false,
                true
            );
            refractionTexture.refreshRate = 2;
            material.subSurface.refractionTexture = refractionTexture;
            refractionTexture.renderList = [];
        } else if (options?.alpha !== undefined && options.alpha < 1.0) {
            material.alpha = options.alpha;
            material.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
            material.needDepthPrePass = false;
            material.backFaceCulling = !(options.doubleSided ?? true);
            material.separateCullingPass = true;
        }

        if (options?.emissiveColor) {
            material.emissiveColor = options.emissiveColor;
        }
        if (options?.useEmissiveMap) {
            material.emissiveTexture = this._loadTexture(
                scene,
                folder,
                matName,
                "emissive",
                u,
                v
            );
            material.emissiveIntensity = options?.emissiveIntensity ?? 1.0;
        }

        return material;
    }
}
