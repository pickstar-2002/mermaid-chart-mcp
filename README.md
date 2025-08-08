# 🎨 Mermaid Chart MCP

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

> 🚀 A powerful Mermaid chart rendering tool based on MCP (Model Context Protocol) for AI editors

## ✨ Features

- 🎯 **MCP Protocol Support** - Seamlessly integrates with AI editors like Cursor, Claude Desktop, WindSurf
- 🎨 **Multiple Formats** - Export charts as PNG or SVG
- 🌈 **Rich Themes** - Support for default, dark, forest, and more themes
- 📏 **Customizable** - Adjust dimensions, background colors, and styling
- ⚡ **Batch Processing** - Render multiple charts simultaneously
- 🔗 **Online Links** - Automatically generate shareable online URLs
- 💾 **Local Storage** - Save charts to your local filesystem
- 📦 **Zero Config** - Works out of the box, no additional setup required

## 🚀 Quick Start

### Installation

Install the package globally or use it directly with npx:

```bash
# Recommended: Use latest version with npx
npx @pickstar-2002/mermaid-chart-mcp@latest

# Or install globally
npm install -g @pickstar-2002/mermaid-chart-mcp@latest
```

### Configuration in AI Editors

#### Cursor IDE

Add to your `settings.json`:

```json
{
  "mcp.servers": {
    "mermaid-chart": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp@latest"]
    }
  }
}
```

#### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mermaid-chart": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp@latest"]
    }
  }
}
```

#### WindSurf

Add to your MCP configuration:

```json
{
  "mcp": {
    "servers": {
      "mermaid-chart": {
        "command": "npx",
        "args": ["@pickstar-2002/mermaid-chart-mcp@latest"]
      }
    }
  }
}
```

## 📖 Usage

Once configured, you can use the following tools in your AI editor:

### 🎯 renderMermaid

Render a Mermaid chart and get an online URL:

```typescript
// Example usage in AI chat
"Please render this flowchart:
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
"
```

### 💾 saveMermaid

Render and save a chart to your local filesystem:

```typescript
// The AI will save the chart locally and provide both local path and online URL
"Save this sequence diagram to ./diagrams/ folder:
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hello Alice!
"
```

### ⚡ batchRenderMermaid

Process multiple charts at once:

```typescript
// Render multiple charts simultaneously
"Create these three charts:
1. A flowchart showing the login process
2. A sequence diagram for API calls  
3. A class diagram for the user model
"
```

## 🛠️ API Reference

### renderMermaid

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mermaidCode` | string | ✅ | Mermaid diagram code |
| `format` | 'png' \| 'svg' | ❌ | Output format (default: 'png') |
| `theme` | string | ❌ | Theme name (default, dark, forest, etc.) |
| `backgroundColor` | string | ❌ | Background color |
| `width` | number | ❌ | Image width in pixels |
| `height` | number | ❌ | Image height in pixels |

### saveMermaid

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mermaidCode` | string | ✅ | Mermaid diagram code |
| `localPath` | string | ✅ | Local directory path |
| `filename` | string | ❌ | Custom filename |
| `format` | 'png' \| 'svg' | ❌ | Output format (default: 'png') |
| `createDir` | boolean | ❌ | Create directory if not exists (default: true) |
| `theme` | string | ❌ | Theme name |
| `backgroundColor` | string | ❌ | Background color |
| `width` | number | ❌ | Image width in pixels |
| `height` | number | ❌ | Image height in pixels |

### batchRenderMermaid

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `items` | Array | ✅ | Array of chart configurations |
| `theme` | string | ❌ | Global theme setting |
| `backgroundColor` | string | ❌ | Global background color |

## 🎨 Supported Themes

- `default` - Clean and professional
- `dark` - Dark mode friendly
- `forest` - Green nature theme
- `base` - Minimal styling
- `neutral` - Balanced colors

## 📋 Supported Chart Types

- 📊 **Flowcharts** - Process flows and decision trees
- 🔄 **Sequence Diagrams** - Interaction timelines
- 📈 **Gantt Charts** - Project timelines
- 🏗️ **Class Diagrams** - Object-oriented structures
- 🌐 **State Diagrams** - State machines
- 📋 **Entity Relationship** - Database schemas
- 🧭 **User Journey** - User experience flows
- 🥧 **Pie Charts** - Data visualization
- 📊 **Bar Charts** - Comparative data
- 🌳 **Git Graphs** - Version control flows

## 🔧 Requirements

- **Node.js** >= 18.0.0
- **AI Editor** with MCP support (Cursor, Claude Desktop, WindSurf, etc.)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**微信: pickstar_loveXX**

---

<div align="center">
Made with ❤️ by <a href="https://github.com/pickstar-2002">pickstar-2002</a>
</div>