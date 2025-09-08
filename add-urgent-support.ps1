# Script PowerShell pour ajouter UrgentSupportSection à toutes les pages

$sourcePath = "C:\Users\camar\Desktop\local-ai\local-ai-main\landing\src\pages"
$files = Get-ChildItem -Path $sourcePath -Recurse -Filter "*.jsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Vérifier si la page a déjà UrgentSupportSection
    if ($content -match "UrgentSupportSection") {
        Write-Host "Skipping $($file.Name) - already has UrgentSupportSection" -ForegroundColor Yellow
        continue
    }
    
    # Vérifier si la page a LocalAIFooter (c'est une vraie page)
    if (-not ($content -match "LocalAIFooter")) {
        Write-Host "Skipping $($file.Name) - no LocalAIFooter found" -ForegroundColor Gray
        continue
    }
    
    Write-Host "Processing $($file.Name)..." -ForegroundColor Green
    
    # Ajouter l'import UrgentSupportSection
    if ($content -match "import \{ LocalAIFooter \} from '\.\./components/LocalAIFooter';") {
        $content = $content -replace "(import \{ LocalAIFooter \} from '\.\./components/LocalAIFooter';)", "`$1`nimport { UrgentSupportSection } from '../components/UrgentSupportSection';"
    } elseif ($content -match "import \{ LocalAIFooter \} from '\.\.\./components/LocalAIFooter';") {
        $content = $content -replace "(import \{ LocalAIFooter \} from '\.\.\./components/LocalAIFooter';)", "`$1`nimport { UrgentSupportSection } from '../../components/UrgentSupportSection';"
    } else {
        # Fallback: ajouter après la dernière ligne d'import
        $importMatch = [regex]::Matches($content, "import.*?;")
        if ($importMatch.Count -gt 0) {
            $lastImport = $importMatch[$importMatch.Count - 1]
            $insertPoint = $lastImport.Index + $lastImport.Length
            
            # Déterminer le bon chemin selon la profondeur du dossier
            $relativePath = if ($file.DirectoryName -match "sectors|usecases|approaches") { "../../components/UrgentSupportSection" } else { "../components/UrgentSupportSection" }
            
            $content = $content.Insert($insertPoint, "`nimport { UrgentSupportSection } from '$relativePath';")
        }
    }
    
    # Ajouter la section avant LocalAIFooter
    $content = $content -replace "(\s+)<LocalAIFooter />", "`$1{/* Section Support Urgente */}`n`$1<UrgentSupportSection />`n`n`$1<LocalAIFooter />"
    
    # Sauvegarder le fichier
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    
    Write-Host "✓ Updated $($file.Name)" -ForegroundColor Green
}

Write-Host "`nScript completed! All pages now have UrgentSupportSection." -ForegroundColor Cyan