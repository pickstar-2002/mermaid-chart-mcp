flowchart TD
    A[源码准备] --> B[Docker镜像构建]
    B --> C[安全扫描]
    C --> D{扫描通过?}
    D -->|否| E[修复漏洞]
    E --> C
    D -->|是| F[镜像优化]
    F --> G[推送到私有仓库]
    G --> H[Kubernetes部署]
    H --> I[服务网格配置]
    I --> J[监控配置]
    J --> K[负载测试]
    K --> L[生产发布]
    
    classDef buildStage fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef securityStage fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef deployStage fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class A,B,F buildStage
    class C,D,E securityStage
    class G,H,I,J,K,L deployStage

xychart-beta
    title "Inference Engine Performance Comparison"
    x-axis [vLLM, TGI, FastChat, Transformers]
    y-axis "Performance Score" 0 --> 100
    
    line [95, 88, 75, 60]
    line [90, 85, 70, 55]
    line [85, 80, 65, 50]

architecture-beta
    group api(cloud)[API Gateway Layer]
    group auth(cloud)[Authentication Layer]  
    group model(server)[Model Service Layer]
    group data(database)[Data Storage Layer]
    group monitor(cloud)[Monitoring Layer]

    service gateway(internet)[Load Balancer] in api
    service firewall(internet)[WAF] in api
    service oauth(server)[OAuth Server] in auth
    service rbac(server)[RBAC Service] in auth
    service inference(server)[Inference Engine] in model
    service cache(database)[Redis Cache] in data
    service db(database)[PostgreSQL] in data
    service metrics(cloud)[Prometheus] in monitor
    service logs(cloud)[ELK Stack] in monitor

    gateway:R --> L:firewall
    firewall:R --> L:oauth
    oauth:R --> L:rbac
    rbac:R --> L:inference
    inference:R --> L:cache
    inference:R --> L:db
    inference:R --> L:metrics
    inference:R --> L:logs

sequenceDiagram
    participant Client as 客户端
    participant Gateway as API网关
    participant Auth as 认证服务
    participant Model as 模型服务
    participant Monitor as 监控系统
    participant Alert as 告警系统
    
    Client->>Gateway: 发送请求
    Gateway->>Monitor: 记录请求指标
    Gateway->>Auth: 验证身份
    Auth->>Monitor: 记录认证指标
    Auth-->>Gateway: 返回认证结果
    Gateway->>Model: 转发请求
    Model->>Monitor: 记录推理指标
    Model-->>Gateway: 返回结果
    Gateway-->>Client: 返回响应
    
    Monitor->>Monitor: 分析指标
    Monitor->>Alert: 触发告警条件
    Alert->>Alert: 发送告警通知
