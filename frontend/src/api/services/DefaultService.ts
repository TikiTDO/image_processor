/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageMeta } from '../models/ImageMeta';

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

}