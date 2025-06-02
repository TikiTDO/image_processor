# DefaultApi

All URIs are relative to *http://localhost:5700*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteImage**](#deleteimage) | **DELETE** /api/images/{id} | |
|[**extras**](#extras) | **POST** /api/v1/extras | |
|[**extrasBatch**](#extrasbatch) | **POST** /api/v1/extras/batch | |
|[**getDefaultPath**](#getdefaultpath) | **GET** /api/path | |
|[**getDialogs**](#getdialogs) | **GET** /api/dialogs | |
|[**getDirs**](#getdirs) | **GET** /api/dirs | |
|[**getHistory**](#gethistory) | **GET** /api/v1/history | |
|[**getImageDescription**](#getimagedescription) | **GET** /api/images/{id}/description | |
|[**getImageDialog**](#getimagedialog) | **GET** /api/images/{id}/dialog | |
|[**getImages**](#getimages) | **GET** /api/images | |
|[**getLoras**](#getloras) | **GET** /api/v1/loras | |
|[**getModels**](#getmodels) | **GET** /api/v1/models | |
|[**getProgress**](#getprogress) | **GET** /api/v1/progress | |
|[**getSpeakers**](#getspeakers) | **GET** /api/speakers | |
|[**getUpdates**](#getupdates) | **GET** /api/updates | |
|[**img2Img**](#img2img) | **POST** /api/v1/img2img | |
|[**ping**](#ping) | **GET** /api/v1/ping | |
|[**regions**](#regions) | **POST** /api/v1/regions | |
|[**reinitDirs**](#reinitdirs) | **POST** /api/dirs/reinit | |
|[**reorderImage**](#reorderimage) | **POST** /api/images/{id}/reorder | |
|[**setImageDialog**](#setimagedialog) | **POST** /api/images/{id}/dialog | |
|[**setSpeakers**](#setspeakers) | **POST** /api/speakers | |
|[**switchModel**](#switchmodel) | **POST** /api/v1/models/switch | |
|[**txt2Img**](#txt2img) | **POST** /api/v1/txt2img | |
|[**uploadImages**](#uploadimages) | **POST** /api/images | |

# **deleteImage**
> deleteImage()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.deleteImage(
    id,
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Image deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **extras**
> Array<ImageResponse> extras(extrasParams)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ExtrasParams
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let extrasParams: ExtrasParams; //

const { status, data } = await apiInstance.extras(
    extrasParams
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **extrasParams** | **ExtrasParams**|  | |


### Return type

**Array<ImageResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Extra operation response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **extrasBatch**
> Array<ImageResponse> extrasBatch(extrasBatchParams)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ExtrasBatchParams
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let extrasBatchParams: ExtrasBatchParams; //

const { status, data } = await apiInstance.extrasBatch(
    extrasBatchParams
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **extrasBatchParams** | **ExtrasBatchParams**|  | |


### Return type

**Array<ImageResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Batch extras response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDefaultPath**
> GetDefaultPath200Response getDefaultPath()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.getDefaultPath();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetDefaultPath200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Default path response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDialogs**
> GetDialogs200Response getDialogs()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getDialogs(
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

**GetDialogs200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | All dialogs map |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDirs**
> Array<DirEntry> getDirs()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getDirs(
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<DirEntry>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of directory entries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHistory**
> Array<HistoryEntry> getHistory()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let imageID: string; // (default to undefined)

const { status, data } = await apiInstance.getHistory(
    imageID
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageID** | [**string**] |  | defaults to undefined|


### Return type

**Array<HistoryEntry>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | History entries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getImageDescription**
> ImageDescription getImageDescription()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getImageDescription(
    id,
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ImageDescription**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Image description |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getImageDialog**
> GetImageDialog200Response getImageDialog()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getImageDialog(
    id,
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

**GetImageDialog200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Dialog entries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getImages**
> Array<ImageMeta> getImages()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getImages(
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<ImageMeta>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of image metadata |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLoras**
> Array<LoraInfo> getLoras()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.getLoras();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<LoraInfo>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Available LoRAs |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getModels**
> Array<ModelInfo> getModels()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.getModels();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ModelInfo>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Available models |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getProgress**
> ProgressResponse getProgress()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let skipCurrentImage: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.getProgress(
    skipCurrentImage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skipCurrentImage** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**ProgressResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Progress information |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSpeakers**
> SpeakerMeta getSpeakers()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.getSpeakers();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**SpeakerMeta**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Speaker metadata |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUpdates**
> string getUpdates()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.getUpdates();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/event-stream


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Server-Sent Events stream of update paths |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **img2Img**
> ImageResponse img2Img(img2ImgRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    Img2ImgRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let img2ImgRequest: Img2ImgRequest; //

const { status, data } = await apiInstance.img2Img(
    img2ImgRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **img2ImgRequest** | **Img2ImgRequest**|  | |


### Return type

**ImageResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Image-to-image response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ping**
> PingResponse ping()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.ping();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PingResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Pong response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **regions**
> regions()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.regions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**501** | Not implemented |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reinitDirs**
> ReinitResponse reinitDirs()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.reinitDirs(
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ReinitResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Number of files renamed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reorderImage**
> reorderImage(reorderImageRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ReorderImageRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let reorderImageRequest: ReorderImageRequest; //
let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.reorderImage(
    id,
    reorderImageRequest,
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderImageRequest** | **ReorderImageRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reorder complete |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setImageDialog**
> setImageDialog(getImageDialog200Response)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    GetImageDialog200Response
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let getImageDialog200Response: GetImageDialog200Response; //
let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.setImageDialog(
    id,
    getImageDialog200Response,
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getImageDialog200Response** | **GetImageDialog200Response**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Dialog saved |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setSpeakers**
> SpeakerMeta setSpeakers(speakerMeta)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    SpeakerMeta
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let speakerMeta: SpeakerMeta; //

const { status, data } = await apiInstance.setSpeakers(
    speakerMeta
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **speakerMeta** | **SpeakerMeta**|  | |


### Return type

**SpeakerMeta**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated speaker metadata |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **switchModel**
> switchModel(switchModelRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    SwitchModelRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let switchModelRequest: SwitchModelRequest; //

const { status, data } = await apiInstance.switchModel(
    switchModelRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **switchModelRequest** | **SwitchModelRequest**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Model switched |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **txt2Img**
> ImageResponse txt2Img(txt2ImgRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    Txt2ImgRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let txt2ImgRequest: Txt2ImgRequest; //

const { status, data } = await apiInstance.txt2Img(
    txt2ImgRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **txt2ImgRequest** | **Txt2ImgRequest**|  | |


### Return type

**ImageResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Text-to-image response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadImages**
> UploadResponse uploadImages()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let files: Array<File>; // (default to undefined)
let path: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.uploadImages(
    files,
    path
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **files** | **Array&lt;File&gt;** |  | defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|


### Return type

**UploadResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upload result |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

