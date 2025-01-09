# Transaction Table
resource "aws_dynamodb_table" "transaction" {
  name           = "Transaction"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "userId"
  range_key      = "transactionId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "transactionId"
    type = "S"
  }

  attribute {
    name = "courseId"
    type = "S"
  }

  global_secondary_index {
    name               = "CourseTransactionsIndex"
    hash_key          = "courseId"
    projection_type    = "ALL"
    read_capacity     = 5
    write_capacity    = 5
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
  }
}

# Course Table
resource "aws_dynamodb_table" "course" {
  name           = "Course"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "courseId"

  attribute {
    name = "courseId"
    type = "S"
  }

  attribute {
    name = "teacherId"
    type = "S"
  }

  global_secondary_index {
    name               = "TeacherCoursesIndex"
    hash_key          = "teacherId"
    projection_type    = "ALL"
    read_capacity     = 5
    write_capacity    = 5
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
  }
}

# UserCourseProgress Table
resource "aws_dynamodb_table" "user_course_progress" {
  name           = "UserCourseProgress"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "userId"
  range_key      = "courseId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "courseId"
    type = "S"
  }

  attribute {
    name = "enrollmentDate"
    type = "S"
  }

  global_secondary_index {
    name               = "EnrollmentDateIndex"
    hash_key          = "courseId"
    range_key         = "enrollmentDate"
    projection_type    = "ALL"
    read_capacity     = 5
    write_capacity    = 5
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
  }
}
