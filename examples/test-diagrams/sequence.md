# 序列图示例

## 基本序列图

```mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    participant C as 数据库
    
    A->>B: 登录请求
    B->>C: 验证用户
    C-->>B: 返回结果
    B-->>A: 登录响应
```

## 复杂序列图

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant G as 网关
    participant A as 认证服务
    participant D as 数据库
    participant C as 缓存
    
    U->>F: 登录请求
    F->>G: 转发请求
    G->>A: 验证用户
    A->>C: 检查缓存
    alt 缓存命中
        C-->>A: 返回用户信息
    else 缓存未命中
        A->>D: 查询数据库
        D-->>A: 返回用户信息
        A->>C: 更新缓存
    end
    A-->>G: 认证结果
    G-->>F: 返回响应
    F-->>U: 显示结果
    
    Note over U,C: 整个认证流程
```

## 带循环的序列图

```mermaid
sequenceDiagram
    participant C as 客户端
    participant S as 服务器
    
    C->>S: 连接请求
    S-->>C: 连接确认
    
    loop 心跳检测
        C->>S: 心跳包
        S-->>C: 心跳响应
    end
    
    C->>S: 断开连接
    S-->>C: 断开确认