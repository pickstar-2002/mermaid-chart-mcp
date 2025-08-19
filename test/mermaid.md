%%{init: {'theme':'base', 'themeVariables': {'primaryColor': '#ff6b6b', 'primaryTextColor': '#fff', 'primaryBorderColor': '#ff4757', 'lineColor': '#5f27cd', 'secondaryColor': '#00d2d3', 'tertiaryColor': '#ff9ff3'}}}%%
flowchart TD
    A[领域专用AI模型] --> B[医疗领域]
    A --> C[法律领域]
    A --> D[金融领域]
    
    B --> B1[病症诊断]
    B --> B2[药物推荐]
    B --> B3[医学影像分析]
    B --> B4[治疗方案制定]
    
    C --> C1[法条检索]
    C --> C2[案例分析]
    C --> C3[合同审查]
    C --> C4[法律咨询]
    
    D --> D1[风险评估]
    D --> D2[投资建议]
    D --> D3[信贷审批]
    D --> D4[市场分析]
    
    classDef medical fill:#ff6b6b,stroke:#ff4757,stroke-width:2px,color:#fff
    classDef legal fill:#5f27cd,stroke:#3742fa,stroke-width:2px,color:#fff
    classDef finance fill:#00d2d3,stroke:#0abde3,stroke-width:2px,color:#fff
    
    class B,B1,B2,B3,B4 medical
    class C,C1,C2,C3,C4 legal
    class D,D1,D2,D3,D4 finance


    %%{init: {'theme':'base', 'themeVariables': {'primaryColor': '#5f27cd', 'primaryTextColor': '#fff', 'primaryBorderColor': '#3742fa', 'lineColor': '#ff6b6b', 'secondaryColor': '#00d2d3', 'tertiaryColor': '#ff9ff3'}}}%%
sequenceDiagram
    participant User as 用户
    participant LegalAI as 法律AI系统
    participant KnowledgeBase as 法律知识库
    participant ReasoningEngine as 推理引擎
    participant CaseDB as 案例数据库
    
    User->>LegalAI: 提交法律咨询
    LegalAI->>KnowledgeBase: 检索相关法条
    KnowledgeBase-->>LegalAI: 返回法条信息
    LegalAI->>CaseDB: 查找相似案例
    CaseDB-->>LegalAI: 返回案例数据
    LegalAI->>ReasoningEngine: 执行法律推理
    ReasoningEngine-->>LegalAI: 推理结果
    LegalAI-->>User: 提供法律建议
    
    Note over ReasoningEngine: 基于规则和案例的<br/>混合推理机制




    %%{init: {'theme':'base', 'themeVariables': {'primaryColor': '#ff6b6b', 'primaryTextColor': '#fff', 'primaryBorderColor': '#ff4757', 'lineColor': '#5f27cd', 'secondaryColor': '#00d2d3', 'tertiaryColor': '#ff9ff3'}}}%%
pie title 三大领域训练成本分布
    "数据采集与清洗" : 35
    "模型训练" : 40
    "评估与优化" : 15
    "部署与维护" : 10




    %%{init: {'theme':'base', 'themeVariables': {'primaryColor': '#00d2d3', 'primaryTextColor': '#fff', 'primaryBorderColor': '#0abde3', 'lineColor': '#ff6b6b', 'secondaryColor': '#5f27cd', 'tertiaryColor': '#ff9ff3'}}}%%
xychart-beta
    title "Domain Model Performance Comparison"
    x-axis [Medical, Legal, Finance, General]
    y-axis "Accuracy (%)" 0 --> 100
    bar [92.3, 89.7, 94.1, 76.2]




    %%{init: {'theme':'base', 'themeVariables': {'primaryColor': '#ff9ff3', 'primaryTextColor': '#000', 'primaryBorderColor': '#ff6b6b', 'lineColor': '#5f27cd', 'secondaryColor': '#00d2d3', 'tertiaryColor': '#ff6b6b'}}}%%
quadrantChart
    title Financial Risk Assessment Matrix
    x-axis Low Risk --> High Risk
    y-axis Low Return --> High Return
    quadrant-1 High Risk High Return
    quadrant-2 Low Risk High Return
    quadrant-3 Low Risk Low Return
    quadrant-4 High Risk Low Return
    Government Bonds: [0.2, 0.3]
    Blue Chip Stocks: [0.4, 0.6]
    Growth Stocks: [0.7, 0.8]
    Cryptocurrency: [0.9, 0.9]
    Real Estate: [0.5, 0.5]


    