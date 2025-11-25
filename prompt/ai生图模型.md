# Seedream-4.0 Image Generation

> - Seedream 4.0 (doubao-seedream-4.0) model supports text-to-image, image-to-image, image editing and other generation modes
- Asynchronous processing mode, use the returned task ID to [query](/en/api-manual/task-management/get-task-detail)
- Generated image links are valid for 24 hours, please save them promptly

## OpenAPI

````yaml en/api-manual/image-series/seedream-4.0/seedream-4.0-image-generate.json post /v1/images/generations
paths:
  path: /v1/images/generations
  method: post
  servers:
    - url: https://api.evolink.ai
      description: Production environment
  request:
    security:
      - title: bearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                ##All APIs require Bearer Token authentication##


                **Get API Key:**


                Visit [API Key Management
                Page](https://evolink.ai/dashboard/keys) to get your API Key


                **Add to request header when using:**

                ```

                Authorization: Bearer YOUR_API_KEY

                ```
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              model:
                allOf:
                  - type: string
                    description: Image generation model name
                    enum:
                      - doubao-seedream-4.0
                    default: doubao-seedream-4.0
                    example: doubao-seedream-4.0
              prompt:
                allOf:
                  - type: string
                    description: >-
                      Prompt describing the image to be generated, or describing
                      how to edit the input image, limited to 2000 tokens
                    example: A serene lake reflecting the beautiful sunset scenery
                    maxLength: 2000
              'n':
                allOf:
                  - type: integer
                    description: >-
                      Specifies the upper limit for the number of images to
                      generate, supports any integer value between `[1,15]`


                      **Note:**

                      - If you need to generate multiple images, please include
                      in the prompt: " `generate 2 different images` " or
                      similar instructions


                      - Reference image count + final generated image count ≤ 15


                      - If: reference image count + required images in prompt >
                      15, and required images in prompt ≤ parameter n value,
                      then final generated image count = 15 - reference image
                      count

                      - Single request will pre-charge based on the value of
                      `n`, actual billing is based on the number of images
                      generated
                    example: 1
              size:
                allOf:
                  - type: string
                    description: >-
                      Size of generated images, supports two formats:


                      **Simplified format:**

                      - `1K`, `2K`, `4K`


                      **Pixel format:**

                      - Width x height, such as: `1280x720`, `1024x1024`,
                      `4096x4096` and other values within the range

                      - Total pixel range: `[1280x720, 4096x4096]`

                      - Aspect ratio range: `[1/16, 16]`
                    example: 2048x2048
              image_urls:
                allOf:
                  - type: array
                    description: >-
                      Reference image URL list for image-to-image and image
                      editing functions


                      **Note:**

                      - Maximum number of input images per request: `10`

                      - Image size: not exceeding `10MB`

                      - Supported image formats: `.jpeg`, `.jpg`, `.png`

                      - Aspect ratio (width/height) range: `[1/3, 3]`

                      - Total pixels: not exceeding `6000×6000`

                      - Image URLs must be directly accessible by the server, or
                      the image URL should directly download when accessed
                      (typically these URLs end with image file extensions, such
                      as `.png`, `.jpg`)
                    items:
                      type: string
                      format: uri
                    maxItems: 10
                    example:
                      - https://example.com/image1.png
                      - https://example.com/image2.png
              callback_url:
                allOf:
                  - type: string
                    description: >-
                      HTTPS callback address after task completion


                      **Callback Timing:**

                      - Triggered when task is completed, failed, or cancelled

                      - Sent after billing confirmation is completed


                      **Security Restrictions:**

                      - Only HTTPS protocol is supported

                      - Callback to internal IP addresses is prohibited
                      (127.0.0.1, 10.x.x.x, 172.16-31.x.x, 192.168.x.x, etc.)

                      - URL length must not exceed `2048` characters


                      **Callback Mechanism:**

                      - Timeout: `10` seconds

                      - Maximum `3` retries on failure (retries after `1`
                      second/`2` seconds/`4` seconds)

                      - Callback response body format is consistent with the
                      task query API response format

                      - Callback address returning 2xx status code is considered
                      successful, other status codes will trigger retry
                    format: uri
                    example: https://your-domain.com/webhooks/image-task-completed
            required: true
            refIdentifier: '#/components/schemas/ImageGenerationRequest'
            requiredProperties:
              - model
              - prompt
        examples:
          text_to_image:
            summary: Text to Image
            value:
              model: doubao-seedream-4.0
              prompt: A serene lake reflecting the beautiful sunset scenery
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              created:
                allOf:
                  - type: integer
                    description: Task creation timestamp
                    example: 1757165031
              id:
                allOf:
                  - type: string
                    description: Task ID
                    example: task-unified-1757165031-seedream4d
              model:
                allOf:
                  - type: string
                    description: Actual model name used
                    example: doubao-seedream-4.0
              object:
                allOf:
                  - type: string
                    enum:
                      - image.generation.task
                    description: Specific type of the task
              progress:
                allOf:
                  - type: integer
                    description: Task progress percentage (0-100)
                    minimum: 0
                    maximum: 100
                    example: 0
              status:
                allOf:
                  - type: string
                    description: Task status
                    enum:
                      - pending
                      - processing
                      - completed
                      - failed
                    example: pending
              task_info:
                allOf:
                  - $ref: '#/components/schemas/TaskInfo'
                    description: Async task information
              type:
                allOf:
                  - type: string
                    enum:
                      - text
                      - image
                      - audio
                      - video
                    description: Output type of the task
                    example: image
              usage:
                allOf:
                  - $ref: '#/components/schemas/Usage'
                    description: Usage and billing information
            refIdentifier: '#/components/schemas/ImageGenerationResponse'
        examples:
          example:
            value:
              created: 1757165031
              id: task-unified-1757165031-seedream4d
              model: doubao-seedream-4.0
              object: image.generation.task
              progress: 0
              status: pending
              task_info:
                can_cancel: true
                estimated_time: 45
              type: image
              usage:
                billing_rule: per_call
                credits_reserved: 1.8
                user_group: default
        description: Image generation task created successfully
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - &ref_0
                    type: object
                    properties:
                      code:
                        type: integer
                        description: HTTP status error code
                      message:
                        type: string
                        description: Error description
                      type:
                        type: string
                        description: Error type
                      param:
                        type: string
                        description: Related parameter name
                      fallback_suggestion:
                        type: string
                        description: Suggestion when error occurs
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 400
                message: Invalid request parameters
                type: invalid_request_error
        description: Invalid request parameters
    '401':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 401
                message: Invalid or expired token
                type: authentication_error
        description: Unauthenticated, invalid or expired token
    '402':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 402
                message: Insufficient quota
                type: insufficient_quota_error
                fallback_suggestion: https://evolink.ai/dashboard/billing
        description: Insufficient quota, recharge required
    '403':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 403
                message: Access denied for this model
                type: permission_error
                param: model
        description: Access denied
    '404':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 404
                message: Specified model not found
                type: not_found_error
                param: model
                fallback_suggestion: doubao-seedream-4.0
        description: Resource not found
    '413':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 413
                message: Image file too large
                type: request_too_large_error
                param: image_urls
                fallback_suggestion: compress image to under 4MB
        description: Request body too large
    '429':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 429
                message: Rate limit exceeded
                type: rate_limit_error
                fallback_suggestion: retry after 60 seconds
        description: Rate limit exceeded
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 500
                message: Internal server error
                type: internal_server_error
                fallback_suggestion: try again later
        description: Internal server error
    '502':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 502
                message: Upstream AI service unavailable
                type: upstream_error
                fallback_suggestion: try different model
        description: Upstream service error
    '503':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 503
                message: Service temporarily unavailable
                type: service_unavailable_error
                fallback_suggestion: retry after 30 seconds
        description: Service temporarily unavailable
  deprecated: false
  type: path
components:
  schemas:
    TaskInfo:
      type: object
      properties:
        can_cancel:
          type: boolean
          description: Whether the task can be cancelled
          example: true
        estimated_time:
          type: integer
          description: Estimated completion time (seconds)
          minimum: 0
          example: 45
    Usage:
      type: object
      description: Usage and billing information
      properties:
        billing_rule:
          type: string
          description: Billing rule
          enum:
            - per_call
            - per_token
            - per_second
          example: per_call
        credits_reserved:
          type: number
          description: Estimated credits consumed
          minimum: 0
          example: 1.8
        user_group:
          type: string
          description: User group category
          example: default

````