$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:8080/")
$http.Start()
Write-Host "Servidor rodando em http://localhost:8080" -ForegroundColor Green

$rootPath = Split-Path -Parent $PSScriptRoot

while ($http.IsListening) {
    $context = $http.GetContext()
    $localPath = $context.Request.Url.LocalPath

    # Redirect root to home.html
    if ($localPath -eq "/") { $localPath = "/home.html" }

    # Build file path
    $filePath = $rootPath + $localPath

    # If file doesn't exist, try adding .html
    if (-not (Test-Path $filePath)) {
        $filePath = $filePath + ".html"
    }

    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllBytes($filePath)

        # Set content type based on extension
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        switch ($ext) {
            ".html" { $context.Response.ContentType = "text/html; charset=utf-8" }
            ".css"  { $context.Response.ContentType = "text/css" }
            ".js"   { $context.Response.ContentType = "application/javascript" }
            ".jpg"  { $context.Response.ContentType = "image/jpeg" }
            ".jpeg" { $context.Response.ContentType = "image/jpeg" }
            ".png"  { $context.Response.ContentType = "image/png" }
            ".gif"  { $context.Response.ContentType = "image/gif" }
            ".svg"  { $context.Response.ContentType = "image/svg+xml" }
            ".xml"  { $context.Response.ContentType = "application/xml" }
            ".txt"  { $context.Response.ContentType = "text/plain" }
            default { $context.Response.ContentType = "application/octet-stream" }
        }

        $context.Response.ContentLength64 = $content.Length
        $context.Response.OutputStream.Write($content, 0, $content.Length)
        Write-Host "200 OK - $localPath"
    } else {
        $notFoundPage = [System.IO.File]::ReadAllBytes("$rootPath\404.html")
        $context.Response.StatusCode = 404
        $context.Response.ContentType = "text/html; charset=utf-8"
        $context.Response.ContentLength64 = $notFoundPage.Length
        $context.Response.OutputStream.Write($notFoundPage, 0, $notFoundPage.Length)
        Write-Host "404 Not Found - $localPath" -ForegroundColor Red
    }

    $context.Response.Close()
}
