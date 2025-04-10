# Alias
Remove-Item alias:ls -ErrorAction SilentlyContinue
function ls {
    eza --color=always --long --git --no-filesize --icons=always --no-time --no-user --no-permissions
}
Remove-Item alias:cd -ErrorAction SilentlyContinue
function cd {
    z
}
function refresh {
    # Recarrega as variáveis do Path
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

    # Recarega o perfil do PowerShell
    . $PROFILE
}

function trash {
  start shell:RecycleBinFolder
}

# Commands to Partitions
function b {
    Set-Location B:\
    ls
}
function c {
    Set-Location $HOME
    ls
}
function d {
    Set-Location D:\
    ls
}
function e {
    Set-Location E:\
    ls
}
function g {
    Set-Location G:\
    ls
}


# Initialization
Invoke-Expression (&starship init powershell)
Invoke-Expression (& { (zoxide init powershell | Out-String)})

# PSREADLINE
# Habilita sugestões preditivas com base no histórico
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -PredictionViewStyle Inline

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
