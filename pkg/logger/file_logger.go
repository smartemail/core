package logger

import (
	"os"
	"strings"
	"time"

	"gopkg.in/natefinch/lumberjack.v2"
)

type FileLoggerInterface interface {
	Info(msg string)
	Error(msg string)
	Debug(msg string)
	Prompt(msg string)
}

type fileLogger struct {
	infoLogger  *lumberjack.Logger
	errorLogger *lumberjack.Logger
	debugLogger *lumberjack.Logger
	promtLogger *lumberjack.Logger
}

func NewFileLogger(logPath string) FileLoggerInterface {

	if logPath == "" {
		logPath = "./logs/"
	}

	// Ensure logPath ends with a path separator
	if !strings.HasSuffix(logPath, "/") && !strings.HasSuffix(logPath, "\\") {
		logPath = logPath + "/"
	}

	// Create directory if it does not exist
	if err := os.MkdirAll(logPath, 0o755); err != nil {
		// If directory creation fails, fall back to current directory
		logPath = "./"
	}

	return &fileLogger{
		infoLogger: &lumberjack.Logger{
			Filename:   logPath + "info.log",
			MaxSize:    500,
			MaxBackups: 3,
			MaxAge:     28,
			Compress:   true,
		},

		errorLogger: &lumberjack.Logger{
			Filename:   logPath + "error.log",
			MaxSize:    500,
			MaxBackups: 3,
			MaxAge:     28,
			Compress:   true,
		},

		debugLogger: &lumberjack.Logger{
			Filename:   logPath + "debug.log",
			MaxSize:    500,
			MaxBackups: 3,
			MaxAge:     28,
			Compress:   true,
		},

		promtLogger: &lumberjack.Logger{
			Filename:   logPath + "prompts.log",
			MaxSize:    500,
			MaxBackups: 3,
			MaxAge:     28,
			Compress:   true,
		},
	}
}

func (l *fileLogger) Info(msg string) {
	l.infoLogger.Write([]byte(time.Now().Format("2006-01-02 15:04:05") + ": " + msg + "\n"))
}

func (l *fileLogger) Error(msg string) {
	l.errorLogger.Write([]byte(time.Now().Format("2006-01-02 15:04:05") + ": " + msg + "\n"))
}

func (l *fileLogger) Debug(msg string) {
	l.debugLogger.Write([]byte(time.Now().Format("2006-01-02 15:04:05") + ": " + msg + "\n"))
}

func (l *fileLogger) Prompt(msg string) {
	l.promtLogger.Write([]byte(time.Now().Format("2006-01-02 15:04:05") + ": " + msg + "\n"))
}
