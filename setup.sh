#!/bin/bash

# EduChain Setup Script
# This script helps set up the EduChain project with all necessary dependencies

set -e

echo "🚀 Setting up EduChain - Blockchain Academic Certificate System"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION"
}

# Check if MongoDB is installed
check_mongodb() {
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB is not installed. Please install MongoDB from https://www.mongodb.com/try/download/community"
        print_warning "Or use MongoDB Atlas for cloud hosting"
    else
        print_status "MongoDB is installed"
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating backend .env file..."
        cp .env.example .env
        print_warning "Please edit backend/.env with your configuration values"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating frontend .env file..."
        cp .env.example .env
        print_warning "Please edit frontend/.env with your configuration values"
    fi
    
    cd ..
}

# Create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Backend startup script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "Starting EduChain Backend..."
cd backend
npm start
EOF
    
    # Frontend startup script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "Starting EduChain Frontend..."
cd frontend
npm start
EOF
    
    # Make scripts executable
    chmod +x start-backend.sh start-frontend.sh
    
    print_status "Created startup scripts: start-backend.sh and start-frontend.sh"
}

# Create development startup script
create_dev_script() {
    print_status "Creating development startup script..."
    
    cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "Starting EduChain in Development Mode..."
echo "========================================="

# Function to cleanup on exit
cleanup() {
    echo "Shutting down..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Start backend in background
echo "Starting backend server..."
cd backend && npm start &

# Wait a bit for backend to start
sleep 5

# Start frontend in background
echo "Starting frontend server..."
cd ../frontend && npm start &

# Wait for both processes
wait
EOF
    
    chmod +x start-dev.sh
    print_status "Created development startup script: start-dev.sh"
}

# Main setup function
main() {
    print_status "Starting EduChain setup..."
    
    # Check prerequisites
    check_nodejs
    check_npm
    check_mongodb
    
    # Setup components
    setup_backend
    setup_frontend
    
    # Create helper scripts
    create_startup_scripts
    create_dev_script
    
    print_status "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit backend/.env with your configuration"
    echo "2. Edit frontend/.env with your configuration"
    echo "3. Start MongoDB: mongod"
    echo "4. Run the application:"
    echo "   - Development: ./start-dev.sh"
    echo "   - Production: ./start-backend.sh & ./start-frontend.sh"
    echo ""
    echo "The application will be available at:"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:5000"
    echo ""
    print_status "Happy coding! 🎉"
}

# Run main function
main