// assets/scripts/services/ApiService.ts

import { Singleton } from '../core/Singleton';  // adjust path as needed
import { EventBus } from '../core/EventBus';    // optional, for loader/error events

export class ApiService extends Singleton<ApiService> {
	private cache: Map<string, any> = new Map();
	private enableCaching: boolean = false;

	constructor() {
		super();
	}

	public enableCache(enable: boolean) {
		this.enableCaching = enable;
	}

	private async request<T>(
		endpoint: string,
		method: string = 'GET',
		body?: any,
		headers: any = {},
		retryCount: number = 0
	): Promise<T> {
		const url = `${endpoint}`;

		// Check cache for GET
		if (method === 'GET' && this.enableCaching && this.cache.has(url)) {
			return this.cache.get(url);
		}

		const finalHeaders = {
			'Content-Type': 'application/json',
			...headers
		};

		const options: RequestInit = {
			method,
			headers: finalHeaders
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		EventBus.emit("SHOW_LOADER");

		for (let attempt = 0; attempt <= retryCount; attempt++) {
			try {
				const response = await fetch(url, options);
				const contentType = response.headers.get("Content-Type") || "";

				let responseData: any;
				if (contentType.includes("application/json")) {
					responseData = await response.json();
				} else {
					responseData = await response.text(); // fallback for non-JSON
				}

				if (!response.ok) {
					const error = new Error(response.statusText || 'Request failed');
					(error as any).status = response.status;
					(error as any).body = responseData;
					throw error;
				}

				if (method === 'GET' && this.enableCaching) {
					this.cache.set(url, responseData);
				}

				// EventBus.emit("HIDE_LOADER");
				return responseData;
			} catch (error: any) {
				if (attempt === retryCount) {
					throw error;
				}
				await this.delay(500);
			}
		}

		// EventBus.emit("HIDE_LOADER");
		throw new Error("Unexpected request failure");
	}

	private delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	public async get<T>(endpoint: string, headers?: any): Promise<T> {
		return this.request<T>(endpoint, 'GET', undefined, headers);
	}

	public async post<T>(endpoint: string, body: any, headers?: any): Promise<T> {
		return this.request<T>(endpoint, 'POST', body, headers);
	}

	public async put<T>(endpoint: string, body: any, headers?: any): Promise<T> {
		return this.request<T>(endpoint, 'PUT', body, headers);
	}

	public async delete<T>(endpoint: string, headers?: any): Promise<T> {
		return this.request<T>(endpoint, 'DELETE', undefined, headers);
	}

	public clearCache() {
		this.cache.clear();
	}
}
