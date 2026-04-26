$files = Get-ChildItem "C:\Users\30390\Desktop" -Filter "*.xlsx" | Where-Object { $_.Name -like "*第九届*" }
foreach ($f in $files) {
    Write-Host "Found file: $($f.FullName)"
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $wb = $excel.Workbooks.Open($f.FullName)
    $ws = $wb.Sheets.Item(1)
    $range = $ws.UsedRange
    $data = @()
    for($row = 1; $row -le $range.Rows.Count; $row++) {
        $rowData = @()
        for($col = 1; $col -le $range.Columns.Count; $col++) {
            $rowData += $ws.Cells.Item($row, $col).Text
        }
        $data += ,($rowData -join "|")
    }
    $wb.Close($false)
    $excel.Quit()
    $data | Out-File -FilePath "C:\Users\30390\student-inventory-web\members.txt" -Encoding UTF8
    Write-Host "Done!"
}
