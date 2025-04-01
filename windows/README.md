# Configuration for Full Windows Powershell Terminal
> A configuração completa de como eu utilizo o meu terminal no meu dia a dia.  
> A cada instalação, é recomendado reiniciar o terminal.  

1. Open `Terminal`  
1.1 Go to Settings `CTRL+,`  
1.2 Open `Open JSON File`  
  1.2.1 Config [Catppuccin for Windows Terminal](https://github.com/catppuccin/windows-terminal?tab=readme-ov-file)  
1.3 In **Inicialization**  
  1.3.1 **Default Profile** select: `Windows Powershel`
  1.3.2 **Default Terminal App**: `Windows Terminal`  
  1.3.3 **Launch on machine startup**: `ON`  
2. Close and Open Terminal (Powershell should be Open)  
3. Install [starship](https://starship.rs/): `winget install --id Starship.Starship`  
  3.1 Open Your profile `code $PROFILE`  
  3.2 Add this to running starship: `Invoke-Expression (&starship init powershell)`  
4. Install [JestBrains NerdFonts](https://www.nerdfonts.com/font-downloads)  
5. Open `Terminal`  
5.1 Go to Settings: `CTRL+,`  
5.2 Aside Menu Profile: `Windows Powershell`  
5.3 In **Appearance**  
  5.1.1 **Color Scheme**: `Catppuccin Mocha`  
  5.1.2 **Font Type**: `JetBrainsMono Nerd Font`  
  5.1.3 **Ajuste automaticamente a clareza do texto indistinguível**: `Apenas para cores no esquema de cores`  
  5.1.4 **Cursor**: `Caixa cheia`  
  5.1.5 **Estilo de texto intenso**: `Fonte em negrito com cores brilhantes`  
  5.1.6 **Opacidade de Fundo**: `80%`  
  5.1.7 **Habilitar material acrílico**: `ON`  
<!-- 7. Install [Bat](https://github.com/sharkdp/bat): `sudo apt install bat`  -->  
6. Install [Eza](https://github.com/eza-community/eza): `winget install eza-community.eza`  
  6.1 Open Profile `code $PROFILE`  
  6.2 And add this configurations:  
  ```Powershell
    Remove-Item alias:ls -ErrorAction SilentlyContinue
    function ls {
      eza --color=always --long --git --no-filesize --icons=always --no-time --no-user --no-permissions
    }
  ```  
  6.3 Run cmd: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`  
  6.4 Rejoin Terminal.  
7. Install [Scoop](): `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`  
7.1 `irm get.scoop.sh | iex`  
8. Install [Zoxide](https://github.com/ajeetdsouza/zoxide): `scoop install zoxide`  
8.1 Add your Profile: `Invoke-Expression (& { (zoxide init powershell | Out-String) })`  
8.2 Add your Profile:
  ```PowerShell
    Remove-Item alias:cd -ErrorAction SilentlyContinue
    function cd {
      z
    }
  ```
9. Install [PSReadLine](https://github.com/PowerShell/PSReadLine):  
9.1 Verify PowerShellGet: `Get-Module -Name PowerShellGet -ListAvailable`  
9.2 Install PowerShellGet: `Install-Module -Name PowerShellGet -Force -AllowClobber`  
  9.2.1 If using PowerShell 5.1 need: `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`  
9.3 Confirm installation: `Get-Module -Name PowerShellGet -ListAvailable`  
9.4 Install Module: `Install-Module -Name PowerShellGet -Force; exit`  
9.5 Install PSReadLine: `Install-Module PSReadLine -Repository PSGallery -Scope CurrentUser -Force`  
9.6 Enable Suggests: `Get-Module PSReadLine`  
9.7 Add in your Profile:  
  ```PowerShell
    # PSREADLINE
    # Habilita sugestões preditivas com base no histórico
    Set-PSReadLineOption -PredictionSource History
    Set-PSReadLineOption -PredictionViewStyle Inline
  ```
10. Install [FZF](https://github.com/junegunn/fzf): `winget install fzf`  
10.1 Add in Profile:
  ```PowerShell
    #FZF
    $env:FZF_CTRL_T_OPTS = "--style full --walker-skip .git,/node_modules,target --preview 'bat -n --color=always {}' --bind 'ctrl-/:change-preview-window(down|hidden|)'"
    # Define as opções do FZF para o atalho (mesmo que o FZF use essa variável internamente)
    $env:FZF_CTRL_T_OPTS = "--style full --walker-skip .git,/node_modules,target --preview 'bat -n --color=always {}' --bind 'ctrl-/:change-preview-window(down|hidden|)'"

    # Define o atalho Ctrl+t para chamar o FZF com preview usando bat
    Set-PSReadLineKeyHandler -Chord "Ctrl+t" -ScriptBlock {
        $selection = fzf --preview "bat -n --color=always {}"
        if ($selection) {
            [Microsoft.PowerShell.PSConsoleReadLine]::Insert($selection)
        }
    }
  ```
11. Close and Reopen Terminal.  
12 Paste all content from [Config PowerShell File](./Microsoft.PowerShell_profile.ps1)  

