<?php
/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Contact / booking form handler — Andy Lewis Music
 * ─────────────────────────────────────────────────────────────────────────
 *  Self-contained PHP endpoint for Hostinger shared hosting. Receives the
 *  contact form POST, screens spam (honeypot + optional Cloudflare Turnstile),
 *  and emails the enquiry. Responds JSON to fetch() requests, or redirects
 *  back with a query flag for the no-JavaScript fallback.
 *
 *  SETUP (edit the CONFIG block below on the server, or set env vars):
 *    - TO_EMAIL / BOOKING_EMAIL : where enquiries are delivered
 *    - TURNSTILE_SECRET         : leave '' to disable captcha verification
 *  Nothing here is secret in the repo; real values live only on the host.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ── CONFIG ────────────────────────────────────────────────────────────────
$TO_EMAIL        = getenv('CONTACT_TO_EMAIL')  ?: 'hello@andylewismusic.com';
$BOOKING_EMAIL   = getenv('BOOKING_TO_EMAIL')  ?: 'booking@andylewismusic.com';
$FROM_EMAIL      = getenv('FROM_EMAIL')        ?: 'website@andylewismusic.com';
$TURNSTILE_SECRET = getenv('TURNSTILE_SECRET') ?: '';
$SUBJECT_PREFIX  = '[andylewismusic.com]';
// ───────────────────────────────────────────────────────────────────────────

function wants_json(): bool {
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    $xhr = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest';
    return $xhr || strpos($accept, 'application/json') !== false;
}

function respond(int $code, string $message, bool $ok): void {
    http_response_code($code);
    if (wants_json()) {
        header('Content-Type: application/json');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        $flag = $ok ? 'sent' : 'error';
        header('Location: /contact/?status=' . $flag);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, 'Method not allowed.', false);
}

// Honeypot: real users never fill "company".
if (!empty($_POST['company'])) {
    // Pretend success so bots don't learn anything.
    respond(200, 'Thanks — your message has been sent.', true);
}

// Required fields.
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');
$type    = trim($_POST['type'] ?? 'General');

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    respond(422, 'Please complete all required fields.', false);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, 'Please enter a valid email address.', false);
}
if (mb_strlen($message) > 5000) {
    respond(422, 'That message is a little long — please shorten it.', false);
}

// Optional Cloudflare Turnstile verification.
if ($TURNSTILE_SECRET !== '') {
    $token = $_POST['cf-turnstile-response'] ?? '';
    $verify = @file_get_contents(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        false,
        stream_context_create(['http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query([
                'secret'   => $TURNSTILE_SECRET,
                'response' => $token,
                'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
            ]),
            'timeout' => 8,
        ]])
    );
    $result = json_decode($verify ?: '{}', true);
    if (empty($result['success'])) {
        respond(422, 'Spam check failed — please try again.', false);
    }
}

// Route booking-type enquiries to the booking inbox.
$recipient = in_array($type, ['Booking', 'Session', 'Scoring'], true) ? $BOOKING_EMAIL : $TO_EMAIL;

$body = "New enquiry from andylewismusic.com\n\n"
      . "Type:    {$type}\n"
      . "Name:    {$name}\n"
      . "Email:   {$email}\n"
      . "Subject: {$subject}\n\n"
      . "Message:\n{$message}\n";

$safeName = preg_replace('/[\r\n]+/', ' ', $name);
$headers  = "From: {$safeName} <{$FROM_EMAIL}>\r\n"
          . "Reply-To: {$email}\r\n"
          . "Content-Type: text/plain; charset=UTF-8\r\n";

$mailSubject = "{$SUBJECT_PREFIX} {$type}: {$subject}";

if (@mail($recipient, $mailSubject, $body, $headers)) {
    respond(200, 'Thanks — your message is on its way.', true);
}
respond(500, 'Sorry, something went wrong. Please email hello@andylewismusic.com directly.', false);
