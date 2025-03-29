if status is-interactive
    # Commands to run in interactive sessions can go here
end

# Custom Functions

function recicle_bin_folder
  cmd.exe /c start shell:RecycleBinFolder
end

# Initialization
starship init fish | source
zoxide init fish | source

# Aliases
alias cat="batcat --theme=GitHub"
alias l="ls -la"
alias ls="eza --color=always --long --git --no-filesize --icons=always --no-time --no-user --no-permissions"
alias cd="z"

alias refresh="source ~/.config/fish/config.fish; echo 'Fish config refreshed!!'"
alias github="z d github"
alias trash="recicle_bin_folder"

# FZF
set -x FZF_CTRL_T_OPTS "--style full --walker-skip .git,/node_modules,target --preview 'bat -n --color=always {}' --bind 'ctrl-/:change-preview-window(down|hidden|)'"

function fish_user_key_bindings
    bind \ct "fzf-tmux -- --preview 'bat -n --color=always {}'"
end

