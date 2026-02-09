<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Por favor, preencha todos os campos obrigatórios.'
    ]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Email inválido.'
    ]);
    exit();
}

$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

$to = 'paulo@phdonassolo.com';
$subject = 'Novo Contato do Site - ' . $name;

$email_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0071e3; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f5f5f7; padding: 30px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #0071e3; }
        .value { margin-top: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2 style='margin: 0;'>Novo Contato do Site</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>Nome:</div>
                <div class='value'>{$name}</div>
            </div>
            <div class='field'>
                <div class='label'>Email:</div>
                <div class='value'><a href='mailto:{$email}'>{$email}</a></div>
            </div>
            " . (!empty($phone) ? "
            <div class='field'>
                <div class='label'>Telefone:</div>
                <div class='value'>{$phone}</div>
            </div>
            " : "") . "
            <div class='field'>
                <div class='label'>Mensagem:</div>
                <div class='value'>" . nl2br($message) . "</div>
            </div>
        </div>
        <div class='footer'>
            <p>Este email foi enviado automaticamente pelo formulário de contato do site phdonassolo.com</p>
            <p>Data/Hora: " . date('d/m/Y H:i:s') . "</p>
        </div>
    </div>
</body>
</html>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: Site PHDonassolo <noreply@phdonassolo.com>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$mail_sent = mail($to, $subject, $email_body, $headers);

if ($mail_sent) {
    error_log("Email enviado com sucesso de: {$email}");
    
    echo json_encode([
        'success' => true, 
        'message' => 'Mensagem enviada com sucesso! Retornaremos em breve.'
    ]);
} else {
    error_log("Falha ao enviar email de: {$email}");
    
    echo json_encode([
        'success' => false, 
        'message' => 'Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato via WhatsApp.'
    ]);
}
?>
