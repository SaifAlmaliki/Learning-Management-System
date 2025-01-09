# Define variables for resources
$BUCKET_NAME="cognitechx-terraform-state"
$REGION="eu-central-1"

Write-Host "`n=== Starting Terraform Backend Setup ===" -ForegroundColor Cyan

# Step 1: Create S3 bucket
# The bucket will store the Terraform state files
Write-Host "`nStep 1: Creating S3 bucket '$BUCKET_NAME'..." -ForegroundColor Green
try {
    aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION --create-bucket-configuration LocationConstraint=$REGION
    Write-Host " S3 bucket created successfully" -ForegroundColor Green
} catch {
    Write-Host "! Error creating S3 bucket: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Block public access to the S3 bucket
# This is a security best practice to prevent accidental exposure of state files
Write-Host "`nStep 2: Configuring bucket security..." -ForegroundColor Green
try {
    aws s3api put-public-access-block `
        --bucket $BUCKET_NAME `
        --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    Write-Host " Bucket public access blocked successfully" -ForegroundColor Green
} catch {
    Write-Host "! Error configuring bucket security: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Terraform Backend Setup Complete! ===" -ForegroundColor Cyan
Write-Host "You can now run 'terraform init' in your Terraform directory`n"
