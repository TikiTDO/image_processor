/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Img2ImgRequest = {
    init_images: Array<string>;
    mask?: string;
    prompt: string;
    negative_prompt?: string;
    steps?: number;
    cfg_scale?: number;
    denoising_strength?: number;
};
