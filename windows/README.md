# Configuration for Full Windows Powershell Terminal
> After each installation, it is recommended to restart the terminal.  

1. Open `Terminal`  
1.1 Install PowerShell 7: `winget install --id Microsoft.PowerShell --source winget`  
1.2 Go to Settings `CTRL+,`  
1.3 Open `Open JSON File`  
  1.2.1 Config [Catppuccin for Windows Terminal](https://github.com/catppuccin/windows-terminal?tab=readme-ov-file)  
1.3 In **Inicialization**  
  1.3.1 **Default Profile** select: `Powershel`  
  1.3.2 **Default Terminal App**: `Windows Terminal`  
  1.3.3 **Launch on machine startup**: `ON`  
3. Close and Open Terminal (PowerShell should be Open)  
4. Install [starship](https://starship.rs/): `winget install --id Starship.Starship`  
  3.1 Open Your profile `code $PROFILE`  
  3.2 Add this to running starship: `Invoke-Expression (&starship init powershell)`  
5. Install [JestBrains NerdFonts](https://www.nerdfonts.com/font-downloads)  
6. Open `Terminal`  
5.1 Go to Settings: `CTRL+,`  
5.2 Aside Menu Profile: `Powershell`  
5.3 In **Appearance**  
  5.1.1 **Color Scheme**: `Catppuccin Mocha`  
  5.1.2 **Font Type**: `JetBrainsMono Nerd Font`  
  5.1.3 **Automatically adjust the clarity of indistinguishable text**: `Only for colors in the color scheme`  
  5.1.4 **Cursor**: `Filled box`  
  5.1.5 **Intense text style**: `Bold font with bright colors`  
  5.1.6 **Background Opacity**: `80%`  
  5.1.7 **Enable acrylic material**: `ON`  
7. Install [Bat](https://github.com/sharkdp/bat): `winget install sharkdp.bat`  
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
9.1 Confirm installation: `Get-Module -Name PowerShellGet -ListAvailable`  
9.2 Install Module: `Install-Module -Name PowerShellGet -Force; exit`  
9.3 Install PSReadLine: `Install-Module PSReadLine -Repository PSGallery -Scope CurrentUser -Force`  
9.4 Enable Suggests: `Get-Module PSReadLine`  
9.5 Add in your Profile:  
  ```PowerShell
    # PSREADLINE
    # Enables predictive suggestions based on history
    Set-PSReadLineOption -PredictionSource History
    Set-PSReadLineOption -PredictionViewStyle Inline
  ```
10. Install [FZF](https://github.com/junegunn/fzf): `winget install fzf`  
10.1 Add in Profile:  
  ```PowerShell
    #FZF
    $env:FZF_CTRL_T_OPTS = "--style full --walker-skip .git,/node_modules,target --preview 'bat -n --color=always {}' --bind 'ctrl-/:change-preview-window(down|hidden|)'"
    # Defines FZF options for the shortcut (even though FZF uses this variable internally)
    $env:FZF_CTRL_T_OPTS = "--style full --walker-skip .git,/node_modules,target --preview 'bat -n --color=always {}' --bind 'ctrl-/:change-preview-window(down|hidden|)'"

    # Defines the Ctrl+t shortcut to call FZF with preview using bat
    Set-PSReadLineKeyHandler -Chord "Ctrl+t" -ScriptBlock {
        $selection = fzf --preview "bat -n --color=always {}"
        if ($selection) {
            [Microsoft.PowerShell.PSConsoleReadLine]::Insert($selection)
        }
    }
  ```
11. Close and Reopen Terminal.  
12 Paste all content from [Config PowerShell File](./Microsoft.PowerShell_profile.ps1)  

