// 示例: 如何使用 Mermaid Chart MCP Server

// 1. 简单流程图
const flowchartExample = `
graph TD
    A[开始] --> B{是否有数据?}
    B -->|是| C[处理数据]
    B -->|否| D[获取数据]
    C --> E[显示结果]
    D --> C
    E --> F[结束]
`;

// 2. 序列图
const sequenceExample = `
sequenceDiagram
    participant 用户
    participant 应用
    participant 数据库
    
    用户->>应用: 登录请求
    应用->>数据库: 验证用户
    数据库-->>应用: 返回结果
    应用-->>用户: 登录成功/失败
`;

// 3. 甘特图
const ganttExample = `
gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析           :done, des1, 2024-01-01, 2024-01-05
    系统设计           :done, des2, after des1, 5d
    UI设计            :active, des3, after des2, 3d
    section 开发阶段
    后端开发           :dev1, after des3, 10d
    前端开发           :dev2, after des3, 8d
    测试              :test1, after dev1, 5d
`;

// 4. 类图
const classExample = `
classDiagram
    class User {
        +String name
        +String email
        +Date createdAt
        +login()
        +logout()
    }
    
    class Admin {
        +String permissions
        +manageUsers()
        +viewReports()
    }
    
    class Product {
        +String title
        +Float price
        +Integer stock
        +updateStock()
    }
    
    User <|-- Admin
    Admin --> Product : manages
`;

export { flowchartExample, sequenceExample, ganttExample, classExample };
