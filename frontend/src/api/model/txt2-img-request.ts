/* tslint:disable */
/* eslint-disable */
/**
 * Image Processor API
 * OpenAPI specification for Image Processor backend
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * 
 * @export
 * @interface Txt2ImgRequest
 */
export interface Txt2ImgRequest {
    /**
     * 
     * @type {string}
     * @memberof Txt2ImgRequest
     */
    'prompt': string;
    /**
     * 
     * @type {string}
     * @memberof Txt2ImgRequest
     */
    'negative_prompt'?: string;
    /**
     * 
     * @type {number}
     * @memberof Txt2ImgRequest
     */
    'steps'?: number;
    /**
     * 
     * @type {number}
     * @memberof Txt2ImgRequest
     */
    'cfg_scale'?: number;
    /**
     * 
     * @type {number}
     * @memberof Txt2ImgRequest
     */
    'width'?: number;
    /**
     * 
     * @type {number}
     * @memberof Txt2ImgRequest
     */
    'height'?: number;
    /**
     * 
     * @type {number}
     * @memberof Txt2ImgRequest
     */
    'seed'?: number | null;
}

