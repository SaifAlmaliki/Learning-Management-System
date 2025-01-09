output "transaction_table_name" {
  description = "Name of the Transaction DynamoDB table"
  value       = aws_dynamodb_table.transaction.name
}

output "transaction_table_arn" {
  description = "ARN of the Transaction DynamoDB table"
  value       = aws_dynamodb_table.transaction.arn
}

output "course_table_name" {
  description = "Name of the Course DynamoDB table"
  value       = aws_dynamodb_table.course.name
}

output "course_table_arn" {
  description = "ARN of the Course DynamoDB table"
  value       = aws_dynamodb_table.course.arn
}

output "user_course_progress_table_name" {
  description = "Name of the UserCourseProgress DynamoDB table"
  value       = aws_dynamodb_table.user_course_progress.name
}

output "user_course_progress_table_arn" {
  description = "ARN of the UserCourseProgress DynamoDB table"
  value       = aws_dynamodb_table.user_course_progress.arn
}
