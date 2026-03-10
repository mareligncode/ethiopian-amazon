package utils

import (
	"bytes"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"text/template"
)

type EmailData struct {
	RecipientName string
	Title         string
	Message       string
	ActionURL     string // Optional deep link
}

func SendEmail(to string, data EmailData) {
	go func() {
		host := os.Getenv("EMAIL_HOST")
		port := os.Getenv("EMAIL_PORT")
		user := os.Getenv("EMAIL_USER")
		pass := os.Getenv("EMAIL_PASSWORD")

		if host == "" || user == "" || pass == "" {
			log.Println("SMTP credentials missing from .env, skipping email notification.")
			return
		}

		auth := smtp.PlainAuth("", user, pass, host)

		// A very basic, clean HTML structural template mimicking a premium Amazon email
		htmlTpl := `
			<!DOCTYPE html>
			<html>
			<head><style>body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; } .btn { display: inline-block; padding: 10px 20px; color: #fff; background-color: #f0c14b; text-decoration: none; border-radius: 3px; border: 1px solid #a88734; }</style></head>
			<body>
				<h2>Hello {{.RecipientName}},</h2>
				<h3>{{.Title}}</h3>
				<p>{{.Message}}</p>
				{{if .ActionURL}}
					<br><a href="{{.ActionURL}}" class="btn">View Details</a>
				{{end}}
				<hr>
				<p style="font-size: 12px; color: #777;">Thank you for shopping with the Amazon Clone.</p>
			</body>
			</html>
		`

		t, err := template.New("email").Parse(htmlTpl)
		if err != nil {
			log.Printf("Template parsing error: %v", err)
			return
		}

		var body bytes.Buffer
		mimeHeaders := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
		body.Write([]byte(fmt.Sprintf("Subject: %s\n%s\n\n", data.Title, mimeHeaders)))

		if err := t.Execute(&body, data); err != nil {
			log.Printf("Template execution error: %v", err)
			return
		}

		address := fmt.Sprintf("%s:%s", host, port)
		err = smtp.SendMail(address, auth, user, []string{to}, body.Bytes())
		if err != nil {
			log.Printf("Failed to send email to %s: %v", to, err)
		} else {
			log.Printf("Successfully dispatched Phase 9 Email to: %s", to)
		}
	}()
}
