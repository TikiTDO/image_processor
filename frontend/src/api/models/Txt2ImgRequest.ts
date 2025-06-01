/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Txt2ImgRequest = {
    prompt: string;
    negative_prompt?: string;
    steps?: number;
    cfg_scale?: number;
    width?: number;
    height?: number;
    seed?: number | null;
};
