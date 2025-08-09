# 其他类型图表示例

## 饼图

```mermaid
pie title 用户分布
    "新用户" : 30
    "活跃用户" : 50
    "休眠用户" : 20
```

## 甘特图

```mermaid
gantt
    title 项目进度
    dateFormat YYYY-MM-DD
    section 设计
    需求分析 :done, des1, 2024-01-01, 2024-01-05
    UI设计   :active, des2, 2024-01-06, 2024-01-10
    section 开发
    前端开发 :dev1, 2024-01-11, 2024-01-20
    后端开发 :dev2, 2024-01-15, 2024-01-25
    section 测试
    单元测试 :test1, 2024-01-21, 2024-01-23
    集成测试 :test2, 2024-01-24, 2024-01-26
```

## 类图

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Admin {
        +String permissions
        +manageUsers()
        +viewLogs()
    }
    
    class Database {
        +connect()
        +query()
        +close()
    }
    
    User <|-- Admin
    User --> Database : uses
```

## 状态图

```mermaid
stateDiagram-v2
    [*] --> 未登录
    未登录 --> 登录中 : 点击登录
    登录中 --> 已登录 : 登录成功
    登录中 --> 未登录 : 登录失败
    已登录 --> 未登录 : 退出登录
    已登录 --> [*]
```

## ER图

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : includes
    
    USER {
        int id PK
        string name
        string email
        datetime created_at
    }
    
    ORDER {
        int id PK
        int user_id FK
        datetime order_date
        decimal total
    }
    
    PRODUCT {
        int id PK
        string name
        decimal price
        int stock
    }
    
    LINE-ITEM {
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }
```

## 思维导图

```mermaid
mindmap
  root((项目管理))
    规划
      需求分析
      时间安排
      资源分配
    执行
      任务分配
      进度跟踪
      质量控制
    监控
      风险管理
      成本控制
      沟通协调
    收尾
      项目验收
      经验总结
      文档归档