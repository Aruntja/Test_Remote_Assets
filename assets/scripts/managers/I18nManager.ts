import { resources, JsonAsset } from 'cc';
import { Singleton } from "db://assets/scripts/core/Singleton";

export class I18nManager extends Singleton<I18nManager> {
	private _languages: Record<string, string> = {};
	private _currentLang: string = 'en';

	async loadLanguage(lang: string): Promise<void> {
		return new Promise((resolve, reject) => {
			// Load the whole directory (e.g. i18n/en)
			resources.loadDir(`i18n/${lang}`, JsonAsset, (err, assets) => {
				if (err) {
					console.error(`[I18nManager] Failed to load language files for '${lang}':`, err);
					reject(err);
					return;
				}

				// Merge all JSON assets into one object
				const merged: Record<string, string> = {};
				for (const asset of assets) {
					Object.assign(merged, asset.json);
				}

				this._languages = merged;
				this._currentLang = lang;
				console.log(`[I18nManager] Loaded language '${lang}'`);
				resolve();
			});
		});
	}

	t(key: string): string {
		return this._languages[key] || key;
	}

	get currentLang(): string {
		return this._currentLang;
	}
}
