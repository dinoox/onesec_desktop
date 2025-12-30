###  获取用户使用统计

**POST** `/usage/statistics`

**认证**: 需要

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| time | int | 是 | 时间戳（毫秒） |
| sign | string | 是 | 请求签名 |

**响应数据**:

| 字段 | 类型 | 说明 |
|------|------|------|
| total_characters | int | 累计输入字数 |
| total_sessions | int | 转写次数 |
| total_duration_minutes | float | 总听写时长（分钟） |
| saved_time_minutes | float | 节省时间（分钟） |
| estimated_typing_speed | int | 预估基准（字/分），固定值 60 |
| average_speed | float | 平均速度（字/分） |

**计算说明**:
- `saved_time_minutes`: 节省时间 = 累计字数 / 60 - 总听写时长
- `average_speed`: 平均速度 = 累计字数 / 总听写时长

**示例响应**:

```json
{
    "code": 0,
    "message": "获取使用统计成功",
    "data": {
        "total_characters": 124590,
        "total_sessions": 89,
        "total_duration_minutes": 450.0,
        "saved_time_minutes": 1626.5,
        "estimated_typing_speed": 60,
        "average_speed": 276.87
    }
}
```

---

## 错误码说明

| HTTP 状态码 | code | 说明 |
|-------------|------|------|
| 200 | 0 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未授权 |
| 403 | 403 | 禁止访问 |
| 404 | 404 | 资源不存在 |
| 429 | 429 | 请求过于频繁 |
| 500 | 500 | 服务器内部错误 |

### 12.1 获取反馈列表

**POST** `/feedback/list`

**认证**: 需要 JWT

**请求参数**:

| 参数   | 类型 | 必填 | 说明                      |
| ------ | ---- | ---- | ------------------------- |
| limit  | int  | 否   | 每页数量（1-100，默认20） |
| offset | int  | 否   | 偏移量（默认0）           |

**响应数据**:

| 字段        | 类型  | 说明     |
| ----------- | ----- | -------- |
| items       | array | 反馈列表 |
| total_count | int   | 总记录数 |
| limit       | int   | 每页数量 |
| offset      | int   | 偏移量   |

items 数组元素:

| 字段        | 类型   | 说明                 |
| ----------- | ------ | -------------------- |
| id          | int    | 反馈 ID              |
| content     | string | 反馈内容             |
| admin_reply | string | 管理员回复（可为空） |
| created_at  | int    | 创建时间戳（秒）     |
| replied_at  | int    | 回复时间戳（可为空） |

**示例响应**:

```json
{
    "code": 0,
    "message": "获取反馈列表成功",
    "data": {
        "items": [
            {
                "id": 1,
                "content": "希望增加暗黑模式",
                "admin_reply": "感谢您的建议，我们会在下个版本中考虑加入此功能",
                "created_at": 1703232000,
                "replied_at": 1703318400
            }
        ],
        "total_count": 1,
        "limit": 20,
        "offset": 0
    }
}
```

---

### 12.2 创建反馈

**POST** `/feedback/create`

**认证**: 需要 JWT

**请求参数**:

| 参数    | 类型   | 必填 | 说明                  |
| ------- | ------ | ---- | --------------------- |
| content | string | 是   | 反馈内容（1-512字符） |

**响应数据**:

| 字段        | 类型   | 说明                 |
| ----------- | ------ | -------------------- |
| id          | int    | 反馈 ID              |
| user_id     | int    | 用户 ID              |
| content     | string | 反馈内容             |
| admin_reply | string | 管理员回复（可为空） |
| created_at  | int    | 创建时间戳（秒）     |
| replied_at  | int    | 回复时间戳（可为空） |

**示例响应**:

```json
{
    "code": 0,
    "message": "创建反馈成功",
    "data": {
        "id": 1,
        "user_id": 100,
        "content": "希望增加暗黑模式",
        "admin_reply": null,
        "created_at": 1703232000,
        "replied_at": null
    }
}
```

---

### 12.3 删除反馈

**POST** `/feedback/delete`

**认证**: 需要 JWT

**请求参数**:

| 参数        | 类型 | 必填 | 说明    |
| ----------- | ---- | ---- | ------- |
| feedback_id | int  | 是   | 反馈 ID |

**说明**: 只能删除自己的反馈

**响应数据**: 无

**示例响应**:

```json
{
    "code": 0,
    "message": "删除反馈成功",
    "data": null
}
```

**错误码**:

| 错误码             | 说明                 |
| ------------------ | -------------------- |
| FEEDBACK_NOT_FOUND | 反馈不存在或无权删除 |

---

## 
