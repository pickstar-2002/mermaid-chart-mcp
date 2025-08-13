# 🎨 Mermaid Chart MCP Server

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@pickstar-2002/mermaid-chart-mcp)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/@pickstar-2002/mermaid-chart-mcp)](https://www.npmjs.com/package/@pickstar-2002/mermaid-chart-mcp)

> 🚀 A powerful Model Context Protocol (MCP) server that renders Mermaid diagrams into high-quality images with seamless AI integration.

## ✨ Features

- 🎯 **AI-First Design**: Seamlessly integrates with Claude Desktop and other MCP clients
- 🖼️ **Multiple Formats**: Export to PNG, SVG, and PDF with high quality
- 🎨 **Rich Theming**: Support for default, dark, forest, and neutral themes
- 📊 **Comprehensive Charts**: Flowcharts, sequence diagrams, Gantt charts, class diagrams, and more
- ⚡ **High Performance**: Optimized rendering with Puppeteer and Sharp
- 🔧 **Zero Configuration**: Works out of the box with all dependencies included
- 🛡️ **Type Safe**: Built with TypeScript for reliability

## � Installation

### For Claude Desktop (Recommended)

```bash
npm install -g @pickstar-2002/mermaid-chart-mcp@latest
```

### For Development

```bash
npm install @pickstar-2002/mermaid-chart-mcp@latest
```

## 🚀 Quick Start

### Claude Desktop Configuration

Add this to your Claude Desktop config file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

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

### Other MCP Clients

```json
{
  "mcpServers": {
    "mermaid-chart": {
      "command": "node",
      "args": ["node_modules/@pickstar-2002/mermaid-chart-mcp/dist/index.js"]
    }
  }
}
```

## 📖 Usage

Once configured, you can use the MCP tool in your AI conversations:

### Basic Example

```json
{
  "tool": "render_mermaid_chart",
  "arguments": {
    "mermaidCode": "graph TD\n    A[Start] --> B[Process]\n    B --> C[End]",
    "outputPath": "./diagrams/flowchart.png"
  }
}
```

### Advanced Configuration

```json
{
  "tool": "render_mermaid_chart",
  "arguments": {
    "mermaidCode": "sequenceDiagram\n    participant User\n    participant System\n    User->>System: Request\n    System-->>User: Response",
    "outputPath": "./diagrams/sequence.svg",
    "format": "svg",
    "width": 1400,
    "height": 1000,
    "theme": "dark",
    "backgroundColor": "#1e1e1e"
  }
}
```

## �️ API Reference

### `render_mermaid_chart`

Renders Mermaid code into high-quality images.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mermaidCode` | string | ✅ | - | The Mermaid diagram code |
| `outputPath` | string | ✅ | - | Output file path with extension |
| `format` | string | ❌ | `"png"` | Output format: `png`, `svg`, `pdf` |
| `width` | number | ❌ | `1200` | Image width in pixels |
| `height` | number | ❌ | `800` | Image height in pixels |
| `theme` | string | ❌ | `"default"` | Theme: `default`, `dark`, `forest`, `neutral` |
| `backgroundColor` | string | ❌ | `"white"` | Background color |

## 📊 Supported Diagram Types

| Type | Description | Example Use Case |
|------|-------------|------------------|
| 📈 **Flowchart** | Process flows and decision trees | Business processes, algorithms |
| 🔄 **Sequence Diagram** | System interactions over time | API calls, user workflows |
| 📅 **Gantt Chart** | Project timelines and schedules | Project planning, milestones |
| 🏗️ **Class Diagram** | Object-oriented design | Software architecture, data models |
| 📊 **XY Chart** | Data visualization | Performance metrics, comparisons |
| 🔀 **State Diagram** | State transitions | UI states, workflow states |
| 🗺️ **User Journey** | User experience mapping | UX design, customer flows |

## 🔧 Development

### Local Setup

```bash
# Clone the repository
git clone https://github.com/pickstar-2002/mermaid-chart-mcp.git
cd mermaid-chart-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Start the MCP server
npm start
```

### Project Structure

```
mermaid-chart-mcp/
├── src/
│   ├── index.ts          # MCP server implementation
│   └── renderer.ts       # Mermaid rendering engine
├── dist/                 # Compiled JavaScript
├── bin/                  # Executable scripts
└── examples/             # Example Mermaid files
```

## � Troubleshooting

### Common Issues

**Puppeteer Download Issues**
```bash
npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
npm install
```

**Permission Errors**
- Ensure output directory has write permissions
- On Windows, run as administrator if needed

**Memory Issues**
```bash
node --max-old-space-size=4096 node_modules/@pickstar-2002/mermaid-chart-mcp/dist/index.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support & Contact

- 📧 **Issues**: [GitHub Issues](https://github.com/pickstar-2002/mermaid-chart-mcp/issues)
- � **Discussions**: [GitHub Discussions](https://github.com/pickstar-2002/mermaid-chart-mcp/discussions)
- 🌐 **Repository**: [GitHub](https://github.com/pickstar-2002/mermaid-chart-mcp)
- 📦 **NPM Package**: [@pickstar-2002/mermaid-chart-mcp](https://www.npmjs.com/package/@pickstar-2002/mermaid-chart-mcp)

---

**微信: pickstar_loveXX**

---

*Built with ❤️ by pickstar-2002*
