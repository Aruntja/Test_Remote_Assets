import {
	assetManager,
	resources,
	SpriteAtlas,
	SpriteFrame,
	Prefab,
	Asset,
	log,
	error,
	AssetManager
} from 'cc';
import { EventBus } from 'db://assets/scripts/core/EventBus';
import { GameEvents } from 'db://assets/scripts/events/GameEvents';
import {GameConfig} from "db://assets/scripts/game/config/GameConfigProxy";

export class AssetLoader {

	private _baseAssetURL: string;
	private _assetCache: Map<string, Asset> = new Map();
	private _bundleCache: Map<string, AssetManager.Bundle> = new Map();

	constructor() {}

	public initAssets() {
		this._baseAssetURL = `${GameConfig.env.assetBasePath}/${GameConfig.gameID}`
		this.loadAssets('primary')
	}

	public loadAssets(bundleName: string){
		this.loadBundleWithProgress(
			`${this._baseAssetURL}/${bundleName}`,
			'images',
			(progress) => {
				EventBus.emit(GameEvents.ON_LOAD_PROGRESS, progress);
			}
		)
		.then((bundle) => {
			console.log('Bundle and assets loaded:', bundle.name);
			EventBus.emit(GameEvents.ASSETS_LOADED, bundle.name);
		})
		.catch((err) => {
			console.error('Load failed:', err);
		});
	}

	private async loadLocal<T extends Asset>(path: string, type: new () => T): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			resources.load(path, type, (err, asset) => {
				if (err) {
					reject(err);
				} else {
					resolve(asset as T);
				}
			});
		});
	}

	private loadRemote<T extends Asset>(url: string, type: new () => T): Promise<T> {
		return new Promise((resolve, reject) => {
			assetManager.loadRemote<T>(url, { ext: this._getExt(url) }, (err, asset) => {
				if (err) {
					error(`[AssetLoader] Failed to load remote asset: ${url}`, err);
					reject(err);
				} else {
					log(`[AssetLoader] Loaded remote asset: ${url}`);
					asset.addRef(); // prevent GC
					resolve(asset);
				}
			});
		});
	}

	async loadSpriteFrameFromAtlas(atlasPath: string, frameName: string, isRemote = false): Promise<SpriteFrame> {
		let atlas: SpriteAtlas;

		if (isRemote) {
			atlas = await this.loadRemote<SpriteAtlas>(atlasPath, SpriteAtlas);
		} else {
			atlas = await this.loadLocal<SpriteAtlas>(atlasPath, SpriteAtlas);
		}

		const frame = atlas.getSpriteFrame(frameName);
		if (!frame) {
			throw new Error(`[AssetLoader] SpriteFrame '${frameName}' not found in atlas '${atlasPath}'`);
		}

		log(`[AssetLoader] SpriteFrame '${frameName}' loaded from atlas '${atlasPath}'`);
		return frame;
	}

	public loadBundle(bundleNameOrUrl: string): Promise<AssetManager.Bundle> {
		return new Promise((resolve, reject) => {
			assetManager.loadBundle(bundleNameOrUrl, (err, bundle) => {
				if (err) {
					error(`[AssetLoader] Failed to load bundle: ${bundleNameOrUrl}`, err);
					reject(err);
				} else {
					log(`[AssetLoader] Loaded bundle: ${bundleNameOrUrl}`);
					// bundle.addRef(); // prevent GC
					this._bundleCache.set(bundle.name, bundle);
					resolve(bundle);
				}
			});
		});
	}



	private _getExt(url: string): string {
		const extMatch = url.match(/\.\w+$/);
		return extMatch ? extMatch[0] : '';
	}

	public async loadBundleWithProgress(
		bundleNameOrUrl: string,
		loadAssetsFromDir: string | null = null,
		onProgress?: (progress: number) => void
	): Promise<AssetManager.Bundle> {
		return new Promise((resolve, reject) => {
			const isRemote = /^(http|https):\/\//.test(bundleNameOrUrl);

			assetManager.loadBundle(bundleNameOrUrl, (err, bundle) => {
				if (err || !bundle) {
					console.error(`[AssetLoader] Failed to load bundle: ${bundleNameOrUrl}`, err);
					reject(err);
					return;
				}

				// console.log(`[AssetLoader] Bundle loaded: ${bundle.name}`);
				// bundle.addRef();
				this._bundleCache.set(bundle.name, bundle);

				if (loadAssetsFromDir) {
					bundle.loadDir(
						loadAssetsFromDir,
						(finished: number, total: number) => {
							if (onProgress && total > 0) {
								onProgress(finished / total);
							}
						},
						(err: Error | null, assets: any[]) => {
							if (err) {
								console.error(`[AssetLoader] Failed to load assets in '${loadAssetsFromDir}'`, err);
								reject(err);
								return;
							}

							assets.forEach((asset) => {
								const key = `${bundle.name}:${asset.name}`;
								asset.addRef();
								this._assetCache.set(key, asset);
							});

							// console.log(`[AssetLoader] Loaded ${assets.length} assets from '${loadAssetsFromDir}'`);
							resolve(bundle);
						}
					);
				} else {
					if (onProgress) onProgress(1);
					resolve(bundle);
				}
			});
		});
	}

	// 🔍 Get asset from cache
	public getAsset<T extends Asset>(key: string): T | null {
		return (this._assetCache.get(key) as T) || null;
	}

	// 🔍 Get bundle from cache
	public getBundle(name: string): AssetManager.Bundle | null {
		return this._bundleCache.get(name) || null;
	}

	// 📝 Store asset manually
	public storeAsset(key: string, asset: Asset) {
		asset.addRef();
		this._assetCache.set(key, asset);
	}
}
