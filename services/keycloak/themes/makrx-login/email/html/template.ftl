<#macro emailLayout>
<html lang="${locale.language}" dir="${(ltr)?then('ltr','rtl')}">
  <body style="font-family: Arial, sans-serif; line-height: 1.5;">
    <div>
      <#nested>
    </div>
    <hr style="margin-top:24px;border:none;border-top:1px solid #e2e8f0;"/>
    <footer style="font-size:12px;color:#4a5568;text-align:center;">
      © ${.now?string("yyyy")} MakrX. All rights reserved.
      <br />
      <a href="https://makrx.org/terms" style="color:#4a5568;text-decoration:underline;">Terms of Service</a> |
      <a href="https://makrx.org/privacy" style="color:#4a5568;text-decoration:underline;">Privacy Policy</a>
    </footer>
  </body>
</html>
</#macro>
