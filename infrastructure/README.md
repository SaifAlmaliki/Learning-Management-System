# CognitechX Academy Infrastructure

This directory contains the Terraform configuration for the CognitechX Academy LMS infrastructure.

## Structure

```
infrastructure/
├── environments/
│   ├── dev/
│   │   └── main.tf
│   └── prod/
│       └── main.tf
├── modules/
│   ├── s3/
│   ├── cloudfront/
│   ├── lambda/
│   ├── api_gateway/
│   ├── route53/
│   └── acm/
└── variables/
    ├── dev.tfvars
    └── prod.tfvars
```

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with appropriate credentials
- Valid SSL certificate for the domain

## Usage

1. Navigate to the desired environment directory:
```bash
cd environments/dev
```

2. Initialize Terraform:
```bash
terraform init
```

3. Plan the changes:
```bash
terraform plan -var-file=../../variables/dev.tfvars
```

4. Apply the changes:
```bash
terraform apply -var-file=../../variables/dev.tfvars
```
