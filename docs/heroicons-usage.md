# 🎨 Heroicons - Guia de Uso

## 📋 Visão Geral

O Heroicons é uma biblioteca de ícones SVG criada pela equipe do Tailwind CSS. Todos os ícones são otimizados para uso com Tailwind CSS e são totalmente responsivos.

## 🚀 Instalação

```bash
npm install @heroicons/react
```

## 📁 Estrutura de Arquivos

```
src/web/components/ui/
├── icons.js          # Exportações dos ícones mais utilizados
├── icon-button.jsx   # Componente de botão com ícone
└── lib/
    └── utils.js      # Utilitários para componentes
```

## 🎯 Como Usar

### 1. Importando Ícones

```javascript
// Importação direta
import { HomeIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';

// Importação dos nossos utilitários
import { HomeIcon, UserIcon, CogIcon } from '@/components/ui/icons';
```

### 2. Usando Ícones em Views EJS

```html
<!-- Ícone básico -->
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>

<!-- Ícone com texto -->
<div class="flex items-center gap-2">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21c-2.796 0-5.216-.584-7.499-1.882z" />
  </svg>
  <span>Usuário</span>
</div>
```

### 3. Tamanhos de Ícones

```html
<!-- Tamanhos disponíveis -->
<svg class="w-3 h-3">...</svg>  <!-- xs (12px) -->
<svg class="w-4 h-4">...</svg>  <!-- sm (16px) -->
<svg class="w-5 h-5">...</svg>  <!-- md (20px) -->
<svg class="w-6 h-6">...</svg>  <!-- lg (24px) -->
<svg class="w-8 h-8">...</svg>  <!-- xl (32px) -->
<svg class="w-10 h-10">...</svg> <!-- 2xl (40px) -->
```

### 4. Cores de Ícones

```html
<!-- Usando cores do tema -->
<svg class="w-5 h-5 text-primary">...</svg>
<svg class="w-5 h-5 text-secondary">...</svg>
<svg class="w-5 h-5 text-destructive">...</svg>

<!-- Usando cores específicas -->
<svg class="w-5 h-5 text-green-600">...</svg>
<svg class="w-5 h-5 text-red-600">...</svg>
<svg class="w-5 h-5 text-blue-600">...</svg>
<svg class="w-5 h-5 text-yellow-600">...</svg>
```

### 5. Botões com Ícones

```html
<!-- Botão primário com ícone -->
<button class="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
  Adicionar
</button>

<!-- Botão secundário com ícone -->
<button class="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
  Sincronizar
</button>
```

## 📚 Ícones Mais Utilizados

### Navegação
- `HomeIcon` - Página inicial
- `UserIcon` - Perfil de usuário
- `CogIcon` - Configurações
- `BellIcon` - Notificações
- `SearchIcon` - Busca
- `MenuIcon` - Menu hambúrguer

### Ações
- `PlusIcon` - Adicionar
- `PencilIcon` - Editar
- `TrashIcon` - Excluir
- `EyeIcon` - Visualizar
- `DownloadIcon` - Baixar
- `UploadIcon` - Enviar

### Status
- `CheckIcon` - Sucesso
- `XCircleIcon` - Erro
- `ExclamationTriangleIcon` - Aviso
- `InformationCircleIcon` - Informação
- `ClockIcon` - Aguardando
- `CalendarIcon` - Data

### Dispositivos
- `ComputerDesktopIcon` - Desktop
- `ServerIcon` - Servidor
- `WifiIcon` - Rede WiFi
- `SignalIcon` - Sinal
- `BatteryFullIcon` - Bateria cheia
- `CpuChipIcon` - Processador

### Gráficos
- `ChartBarIcon` - Gráfico de barras
- `ChartPieIcon` - Gráfico de pizza
- `PresentationChartLineIcon` - Gráfico de linha
- `TableCellsIcon` - Tabela
- `DocumentTextIcon` - Documento

## 🎨 Estilos de Ícones

### Outline (Padrão)
```javascript
import { HomeIcon } from '@heroicons/react/24/outline';
```

### Solid (Preenchido)
```javascript
import { HomeIcon } from '@heroicons/react/24/solid';
```

### Mini (Pequeno)
```javascript
import { HomeIcon } from '@heroicons/react/20/solid';
```

## 🔧 Utilitários

### Função createIcon
```javascript
import { createIcon } from '@/components/ui/icons';

const MyIcon = createIcon(HomeIcon, "w-6 h-6 text-primary");
```

### Função createSizedIcon
```javascript
import { createSizedIcon } from '@/components/ui/icons';

const MyIcon = createSizedIcon(HomeIcon, "lg"); // lg, md, sm, etc.
```

## 📱 Responsividade

Os ícones são naturalmente responsivos e escalam com o texto:

```html
<!-- Ícone que escala com o texto -->
<svg class="w-1em h-1em" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <!-- path -->
</svg>
```

## 🎯 Boas Práticas

1. **Use classes consistentes**: Sempre use `w-5 h-5` para ícones padrão
2. **Mantenha proporção**: Use sempre `w-X h-X` para manter proporção quadrada
3. **Use cores do tema**: Prefira `text-primary` em vez de cores hardcoded
4. **Acessibilidade**: Adicione `aria-label` quando necessário
5. **Performance**: Os ícones SVG são otimizados e leves

## 🔗 Links Úteis

- [Heroicons Website](https://heroicons.com)
- [Heroicons GitHub](https://github.com/tailwindlabs/heroicons)
- [Exemplo de Uso](/icons) - Página de demonstração

## 📝 Exemplo Completo

```html
<!-- Card com ícone -->
<div class="bg-card border border-border rounded-lg p-4">
  <div class="flex items-center gap-3">
    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
    </svg>
    <div>
      <h3 class="font-semibold">Servidor Principal</h3>
      <p class="text-sm text-muted-foreground">Status: Online</p>
    </div>
  </div>
</div>
```

---

**Nota**: Todos os ícones Heroicons são otimizados para uso com Tailwind CSS e seguem as melhores práticas de design e acessibilidade.