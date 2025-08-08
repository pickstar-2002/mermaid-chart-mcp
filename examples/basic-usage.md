# Mermaid Chart MCP 使用示例

## 基础流程图

```mermaid
graph TD
    A[开始] --> B{条件判断}
    B -->|是| C[执行操作A]
    B -->|否| D[执行操作B]
    C --> E[结束]
    D --> E
```

## 序列图

```mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    participant C as 数据库
    
    A->>B: 发送请求
    B->>C: 查询数据
    C-->>B: 返回结果
    B-->>A: 响应数据
```

## 甘特图

```mermaid
gantt
    title 项目时间线
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析           :done,    des1, 2024-01-01,2024-01-05
    UI设计            :done,    des2, 2024-01-06, 2024-01-10
    section 开发阶段
    前端开发          :active,  dev1, 2024-01-11, 2024-01-25
    后端开发          :         dev2, 2024-01-15, 2024-01-30
    section 测试阶段
    单元测试          :         test1, 2024-01-26, 2024-02-05
    集成测试          :         test2, 2024-01-31, 2024-02-10
```

## 类图

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +move()
    }
    
    class Dog {
        +String breed
        +bark()
        +wagTail()
    }
    
    class Cat {
        +String color
        +meow()
        +purr()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat
```

## 状态图

```mermaid
stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中 : 开始处理
    处理中 --> 已完成 : 处理成功
    处理中 --> 失败 : 处理失败
    失败 --> 待处理 : 重新处理
    已完成 --> [*]
```

## 饼图

```mermaid
pie title 市场份额分布
    "产品A" : 42.96
    "产品B" : 50.05
    "产品C" : 10.01
    "其他" : 5
```

## 用户旅程图

```mermaid
journey
    title 用户购物体验
    section 发现产品
      浏览网站: 5: 用户
      搜索产品: 3: 用户
      查看详情: 4: 用户
    section 购买决策
      比较价格: 2: 用户
      阅读评价: 4: 用户
      添加购物车: 5: 用户
    section 完成购买
      结算支付: 3: 用户
      确认订单: 5: 用户
      等待发货: 2: 用户
```

## Git 流程图

```mermaid
gitgraph
    commit id: "初始提交"
    branch develop
    checkout develop
    commit id: "添加功能A"
    commit id: "修复bug"
    checkout main
    merge develop
    commit id: "发布v1.0"
    branch feature
    checkout feature
    commit id: "开发新功能"
    checkout develop
    merge feature
    checkout main
    merge develop
    commit id: "发布v1.1"
```

## 实体关系图

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }
    LINE-ITEM {
        string productCode
        int quantity
        float pricePerUnit
    }
```

## 使用这些示例

你可以将上述任何一个 Mermaid 代码复制并使用 MCP 工具进行渲染：

### 渲染为在线图片
```javascript
{
  "mermaidCode": "graph TD\n    A[开始] --> B[结束]",
  "format": "png",
  "theme": "default"
}
```

### 保存到本地
```javascript
{
  "mermaidCode": "sequenceDiagram\n    A->>B: Hello",
  "localPath": "./diagrams",
  "filename": "sequence.png",
  "format": "png",
  "theme": "dark"
}