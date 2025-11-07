# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x:                |

## Security Features

CanvasLens implements multiple security measures to protect against common web vulnerabilities:

### 1. Input Validation & Sanitization

#### JSON Parsing
- **Secure JSON Parser**: All JSON parsing uses `SecureJsonParser` which:
  - Validates input size (max 10KB) to prevent DoS attacks
  - Checks object depth (max 32 levels) to prevent deeply nested object attacks
  - Validates structure using type guards before processing
  - Prevents prototype pollution through strict validation

**Usage:**
```typescript
// ❌ UNSAFE - Direct JSON.parse
const config = JSON.parse(userInput);

// ✅ SAFE - Secure JSON parser
const config = SecureJsonParser.parseToolConfig(userInput);
```

#### Text Sanitization
- **TextSanitizer**: All user-provided text is sanitized to prevent XSS:
  - Removes dangerous patterns (`javascript:`, event handlers, script tags)
  - Strips HTML tags
  - Removes control characters
  - Limits length (max 1000 characters)

**Usage:**
```typescript
// ✅ SAFE - Text sanitization
const sanitized = TextSanitizer.sanitize(userText);
```

#### URL Validation
- **UrlValidator**: Validates image URLs to prevent:
  - Unsafe protocols (only allows `http:`, `https:`, `data:`)
  - Malicious data URLs (validates MIME type)
  - Extremely long URLs (max 2048 characters)

**Usage:**
```typescript
// ✅ SAFE - URL validation
if (UrlValidator.isValidImageUrl(url)) {
  // Load image
}
```

### 2. XSS Prevention

CanvasLens prevents XSS attacks through:

1. **Text Sanitization**: All text annotations are sanitized before rendering
2. **No innerHTML Usage**: Canvas rendering is used instead of DOM manipulation
3. **Input Validation**: All user inputs are validated and sanitized
4. **Safe JSON Parsing**: Prevents code injection through JSON payloads

### 3. DoS Protection

Protection against Denial of Service attacks:

1. **Size Limits**:
   - JSON input: 10KB maximum
   - Text input: 1000 characters maximum
   - URL length: 2048 characters maximum
   - JSON depth: 32 levels maximum

2. **Request Cancellation**: AbortController support allows canceling long-running operations

3. **Debouncing**: Resize and scroll events are debounced to prevent excessive processing

### 4. Memory Safety

1. **Resource Cleanup**: All components properly clean up:
   - Event listeners are removed on destroy
   - Timeouts are cleared
   - Image resources are released
   - AbortControllers cancel pending requests

2. **Weak References**: Used where appropriate to prevent memory leaks

## Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead, please report it privately:

1. **Email**: [Your security email]
2. **GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

We aim to:
- Acknowledge reports within 48 hours
- Provide initial assessment within 7 days
- Release a fix within 30 days (depending on severity)

## Security Best Practices for Users

### 1. Validate User Input

Always validate user input before passing it to CanvasLens:

```typescript
// ✅ GOOD - Validate before use
if (UrlValidator.isValidImageUrl(userProvidedUrl)) {
  viewer.loadImage(userProvidedUrl);
}

// ❌ BAD - Trust user input
viewer.loadImage(userProvidedUrl);
```

### 2. Sanitize Text Annotations

Text annotations are automatically sanitized, but you should also validate on your end:

```typescript
// ✅ GOOD - Additional validation
const userText = TextSanitizer.sanitize(userInput);
viewer.addAnnotation({
  type: 'text',
  text: userText,
  // ...
});
```

### 3. Use Secure JSON Parsing

When parsing configuration from user input:

```typescript
// ✅ GOOD - Use secure parser
const config = SecureJsonParser.parseToolConfig(userConfigJson);
if (config) {
  viewer.updateTools(config);
}

// ❌ BAD - Direct JSON.parse
const config = JSON.parse(userConfigJson);
viewer.updateTools(config);
```

### 4. Implement CORS Properly

When loading images from external sources:

- Configure CORS headers on your server
- Validate image sources
- Use Content Security Policy (CSP) headers

### 5. Clean Up Resources

Always clean up when removing components:

```typescript
// ✅ GOOD - Proper cleanup
const viewer = document.querySelector('canvas-lens');
// ... use viewer ...
viewer.remove(); // Automatically cleans up
```

### 6. Content Security Policy

Add CSP headers to your application:

```
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self'
```

## Known Security Considerations

### 1. Canvas Rendering

- Canvas rendering is generally safe from XSS
- However, if you export canvas content to DOM, ensure proper sanitization

### 2. Image Loading

- Images are loaded from URLs provided by users
- Browser CORS policies apply
- Validate image sources before loading

### 3. File Uploads

- File uploads are validated for type and size
- Always validate files on the server side as well

## Security Updates

We regularly:
- Review and update dependencies
- Audit code for security issues
- Apply security patches promptly
- Follow security best practices

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Last Updated**: 2024

