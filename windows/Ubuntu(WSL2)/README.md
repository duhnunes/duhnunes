# Configuration for Full WSL Terminal
> A configuração completa de como eu utilizo o meu terminal no meu dia a dia.  
> A cada instalação, é recomendado reiniciar o terminal.  
> Antes de cada instalação, é recomendado o uso de: `sudo apt update`

1. Open `Terminal`  
1.1 Install [WSL](https://learn.microsoft.com/pt-br/windows/wsl/install): `wsl --install`
1.2 Install Ubuntu `wsl --install -d Ubuntu`  
1.3 Go to Settings `CTRL+,`  
1.4 Open `Open JSON File`  
  1.4.1 Config [Catppuccin for Windows Terminal](https://github.com/catppuccin/windows-terminal?tab=readme-ov-file)  
1.5 In **Inicialization**  
  1.5.1 **Default Profile** select: `Ubuntu`
  1.5.2 **Default Terminal App**: `Windows Terminal`  
  1.5.3 **Launch on machine startup**: `ON`  
3. Open Terminal (Ubuntu should open)  
2.1 Type `sudo apt update`  
2.2 Install [Fish Shell](https://fishshell.com/): `sudo apt install fish`  
2.3 Type `chsh -s /usr/bin/fish` to default Fish Shell  
4. Install [starship](https://starship.rs/): `curl -sS https://starship.rs/install.sh | sh`  
5. Install [JestBrains NerdFonts](https://www.nerdfonts.com/font-downloads)  
6. Open `Terminal`  
5.1 Go to Settings: `CTRL+,`  
5.2 Aside Menu Profile: `Ubuntu`  
5.3 In **Appearance**  
  5.1.1 **Color Scheme**: `Catppuccin Mocha`  
  5.1.2 **Font Type**: `JetBrainsMono Nerd Font`  
  5.1.3 **Ajuste automaticamente a clareza do texto indistinguível**: `Apenas para cores no esquema de cores`  
  5.1.4 **Cursor**: `Caixa cheia`  
  5.1.5 **Estilo de texto intenso**: `Fonte em negrito com cores brilhantes`  
  5.1.6 **Opacidade de Fundo**: `80%`  
  5.1.7 **Habilitar material acrílico**: `ON`  
<!-- 7. Install [Bat](https://github.com/sharkdp/bat): `sudo apt install bat`  -->
8. Install [Zoxide](https://github.com/ajeetdsouza/zoxide): `sudo apt install zoxide`  
9. Install [Cargo](https://github.com/rust-lang/cargo): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
10. Instal `sudo apt install build-essential`  
11. Install [Eza](https://github.com/eza-community/eza): `cargo install eza`  
12. Install [FZF](https://github.com/junegunn/fzf): `git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf`  
10.1 Execute Installation: `~/.fzf/install`  

13. Open Terminal and Type: `code ~/.config/fish/config.fish`  
11.1 Paste all content from [Config Fish File](config.fish)  

