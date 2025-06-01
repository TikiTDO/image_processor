/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DirEntry } from '../models/DirEntry';
import type { ExtrasBatchParams } from '../models/ExtrasBatchParams';
import type { ExtrasParams } from '../models/ExtrasParams';
import type { HistoryEntry } from '../models/HistoryEntry';
import type { ImageMeta } from '../models/ImageMeta';
import type { ImageResponse } from '../models/ImageResponse';
import type { Img2ImgRequest } from '../models/Img2ImgRequest';
import type { LoraInfo } from '../models/LoraInfo';
import type { ModelInfo } from '../models/ModelInfo';
import type { PingResponse } from '../models/PingResponse';
import type { ProgressResponse } from '../models/ProgressResponse';
import type { ReinitResponse } from '../models/ReinitResponse';
import type { SpeakerMeta } from '../models/SpeakerMeta';
import type { SwitchModelRequest } from '../models/SwitchModelRequest';
import type { Txt2ImgRequest } from '../models/Txt2ImgRequest';
import type { UploadResponse } from '../models/UploadResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * @returns ImageMeta List of image metadata
     * @throws ApiError
     */
    public static getImages(): CancelablePromise<Array<ImageMeta>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/images',
        });
    }

    /**
     * @param formData
     * @param path
     * @returns UploadResponse Upload result
     * @throws ApiError
     */
    public static uploadImages(
        formData: {
            files: Array<>;
        },
        path?: string,
    ): CancelablePromise<UploadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/images',
            query: {
                'path': path,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * @param id
     * @returns any Dialog entries
     * @throws ApiError
     */
    public static getImageDialog(
        id: string,
    ): CancelablePromise<{
        dialog: Array<string>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/images/{id}/dialog',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any Dialog saved
     * @throws ApiError
     */
    public static setImageDialog(
        id: string,
        requestBody: {
            dialog: Array<string>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/images/{id}/dialog',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @param path
     * @returns any Reorder complete
     * @throws ApiError
     */
    public static reorderImage(
        id: string,
        requestBody: {
            prev_id: string;
            next_id: string;
        },
        path?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/images/{id}/reorder',
            path: {
                'id': id,
            },
            query: {
                'path': path,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param path
     * @returns void
     * @throws ApiError
     */
    public static deleteImage(
        id: string,
        path?: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/images/{id}',
            path: {
                'id': id,
            },
            query: {
                'path': path,
            },
        });
    }

    /**
     * @returns any Default path response
     * @throws ApiError
     */
    public static getDefaultPath(): CancelablePromise<{
        path: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/path',
        });
    }

    /**
     * @param skipCurrentImage
     * @returns ProgressResponse Progress information
     * @throws ApiError
     */
    public static getProgress(
        skipCurrentImage?: boolean,
    ): CancelablePromise<ProgressResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/progress',
            query: {
                'skip_current_image': skipCurrentImage,
            },
        });
    }

    /**
     * @returns string Server-Sent Events stream of update paths
     * @throws ApiError
     */
    public static getUpdates(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/updates',
        });
    }

    /**
     * @param path
     * @returns DirEntry List of directory entries
     * @throws ApiError
     */
    public static getDirs(
        path?: string,
    ): CancelablePromise<Array<DirEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/dirs',
            query: {
                'path': path,
            },
        });
    }

    /**
     * @param path
     * @returns ReinitResponse Number of files renamed
     * @throws ApiError
     */
    public static reinitDirs(
        path?: string,
    ): CancelablePromise<ReinitResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/dirs/reinit',
            query: {
                'path': path,
            },
        });
    }

    /**
     * @param path
     * @returns any All dialogs map
     * @throws ApiError
     */
    public static getDialogs(
        path?: string,
    ): CancelablePromise<{
        dialogs: Record<string, Array<string>>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/dialogs',
            query: {
                'path': path,
            },
        });
    }

    /**
     * @returns SpeakerMeta Speaker metadata
     * @throws ApiError
     */
    public static getSpeakers(): CancelablePromise<SpeakerMeta> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/speakers',
        });
    }

    /**
     * @param requestBody
     * @returns SpeakerMeta Updated speaker metadata
     * @throws ApiError
     */
    public static setSpeakers(
        requestBody: SpeakerMeta,
    ): CancelablePromise<SpeakerMeta> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/speakers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns ImageResponse Text-to-image response
     * @throws ApiError
     */
    public static txt2Img(
        requestBody: Txt2ImgRequest,
    ): CancelablePromise<ImageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/txt2img',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns ImageResponse Image-to-image response
     * @throws ApiError
     */
    public static img2Img(
        requestBody: Img2ImgRequest,
    ): CancelablePromise<ImageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/img2img',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns void
     * @throws ApiError
     */
    public static regions(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/regions',
            errors: {
                501: `Not implemented`,
            },
        });
    }

    /**
     * @param requestBody
     * @returns ImageResponse Extra operation response
     * @throws ApiError
     */
    public static extras(
        requestBody: ExtrasParams,
    ): CancelablePromise<Array<ImageResponse>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/extras',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns ImageResponse Batch extras response
     * @throws ApiError
     */
    public static extrasBatch(
        requestBody: ExtrasBatchParams,
    ): CancelablePromise<Array<ImageResponse>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/extras/batch',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns ModelInfo Available models
     * @throws ApiError
     */
    public static getModels(): CancelablePromise<Array<ModelInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/models',
        });
    }

    /**
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static switchModel(
        requestBody: SwitchModelRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/models/switch',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns LoraInfo Available LoRAs
     * @throws ApiError
     */
    public static getLoras(): CancelablePromise<Array<LoraInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/loras',
        });
    }

    /**
     * @returns PingResponse Pong response
     * @throws ApiError
     */
    public static ping(): CancelablePromise<PingResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ping',
        });
    }

    /**
     * @param imageId
     * @returns HistoryEntry History entries
     * @throws ApiError
     */
    public static getHistory(
        imageId: string,
    ): CancelablePromise<Array<HistoryEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/history',
            query: {
                'imageID': imageId,
            },
        });
    }

}