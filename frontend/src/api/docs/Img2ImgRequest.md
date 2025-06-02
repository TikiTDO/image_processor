# Img2ImgRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**init_images** | **Array&lt;string&gt;** |  | [default to undefined]
**mask** | **string** |  | [optional] [default to undefined]
**prompt** | **string** |  | [default to undefined]
**negative_prompt** | **string** |  | [optional] [default to undefined]
**steps** | **number** |  | [optional] [default to undefined]
**cfg_scale** | **number** |  | [optional] [default to undefined]
**denoising_strength** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { Img2ImgRequest } from './api';

const instance: Img2ImgRequest = {
    init_images,
    mask,
    prompt,
    negative_prompt,
    steps,
    cfg_scale,
    denoising_strength,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
