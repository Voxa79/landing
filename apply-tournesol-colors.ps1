# Script PowerShell pour appliquer automatiquement la palette "Tournesol Souverain" 
# à tous les fichiers React du projet

# Définir les mappings de couleurs
$colorMappings = @{
    # Bleu -> Bleu Pétrole Souverain (Confiance)
    "text-blue-600" = "text-[#034E64]"
    "text-blue-500" = "text-[#034E64]" 
    "text-blue-400" = "text-[#034E64]"
    
    # Violet -> Vert Croissance (Innovation/Développement)
    "text-purple-600" = "text-[#638D13]"
    "text-purple-500" = "text-[#638D13]"
    "text-purple-400" = "text-[#638D13]"
    
    # Vert -> Jaune Prospérité (Succès/ROI)
    "text-green-600" = "text-[#FEB909]"
    "text-green-500" = "text-[#FEB909]"
    "text-green-400" = "text-[#FEB909]"
    
    # Rouge/Orange -> Orange Solaire (Action Critique)
    "text-red-600" = "text-[#F06905]"
    "text-red-500" = "text-[#F06905]"
    "text-red-400" = "text-[#F06905]"
    "text-orange-700" = "text-[#F06905]"
    "text-orange-600" = "text-[#F06905]"
    "text-orange-500" = "text-[#F06905]"
    "text-orange-400" = "text-[#F06905]"
    "text-orange-300" = "text-[#F06905]"
    
    # Cyan/Pink -> Vert Premium (Luxury/Prestige)
    "text-cyan-600" = "text-[#0A3226]"
    "text-cyan-500" = "text-[#0A3226]"
    "text-cyan-400" = "text-[#0A3226]"
    "text-pink-600" = "text-[#0A3226]"
    "text-pink-500" = "text-[#0A3226]"
    "text-pink-400" = "text-[#0A3226]"
}

# Chemins des fichiers à traiter
$basePath = "C:\Users\camar\Desktop\local-ai\local-ai-main\landing\src"
$extensions = @("*.jsx", "*.tsx", "*.js", "*.ts")

# Fonction pour appliquer les remplacements
function Apply-ColorChanges {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    foreach ($oldColor in $colorMappings.Keys) {
        $newColor = $colorMappings[$oldColor]
        $content = $content -replace $oldColor, $newColor
    }
    
    # Sauvegarder seulement si des changements ont été faits
    if ($content -ne $originalContent) {
        Set-Content $filePath -Value $content -NoNewline
        Write-Host "✅ Mis à jour: $filePath" -ForegroundColor Green
        return $true
    }
    
    return $false
}

Write-Host "🌻 Application de la palette 'Tournesol Souverain'..." -ForegroundColor Yellow
Write-Host "📁 Répertoire: $basePath" -ForegroundColor Cyan

$changedFiles = 0
$totalFiles = 0

# Traiter tous les fichiers React/TypeScript
foreach ($extension in $extensions) {
    $files = Get-ChildItem -Path $basePath -Filter $extension -Recurse -File
    
    foreach ($file in $files) {
        $totalFiles++
        if (Apply-ColorChanges -filePath $file.FullName) {
            $changedFiles++
        }
    }
}

Write-Host "" 
Write-Host "🎨 RÉSULTATS:" -ForegroundColor Magenta
Write-Host "   📊 Fichiers traités: $totalFiles" -ForegroundColor White
Write-Host "   ✨ Fichiers modifiés: $changedFiles" -ForegroundColor Green
Write-Host "" 

if ($changedFiles -gt 0) {
    Write-Host "🌻 Palette 'Tournesol Souverain' appliquée avec succès!" -ForegroundColor Green
    Write-Host "🎯 Mapping utilisé:" -ForegroundColor Yellow
    Write-Host "   🌊 Bleu → #034E64 (Confiance Souveraine)" -ForegroundColor Blue
    Write-Host "   🌱 Violet → #638D13 (Croissance Innovation)" -ForegroundColor Green  
    Write-Host "   ☀️ Vert → #FEB909 (Prospérité Succès)" -ForegroundColor Yellow
    Write-Host "   🔥 Rouge/Orange → #F06905 (Action Critique)" -ForegroundColor Red
    Write-Host "   🏔️ Cyan/Pink → #0A3226 (Premium Luxury)" -ForegroundColor DarkGreen
} else {
    Write-Host "ℹ️ Aucun fichier modifié - Palette déjà appliquée" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🚀 Prêt pour un site avec une identité visuelle cohérente!" -ForegroundColor Cyan