# Contributing to MakrX

Thank you for your interest in contributing to the MakrX ecosystem! This guide outlines our development process, coding standards, and contribution workflow.

## 🎯 Overview

MakrX is an ecosystem for makers that values:
- **Quality**: Well-tested, maintainable code
- **Security**: Privacy and data protection first
- **Collaboration**: Open communication and shared ownership
- **Innovation**: Creative solutions to maker community needs

## 🚀 Getting Started

### Prerequisites
```bash
# Required tools
node --version    # v18.0.0+
python --version  # 3.11+
git --version     # Any recent version
docker --version  # 20.10.0+

# Package managers
npm --version     # v8.0.0+
poetry --version  # Latest
```

### Development Setup
```bash
# 1. Fork the repository
git clone https://github.com/YOUR_USERNAME/makrx-ecosystem.git
cd makrx-ecosystem

# 2. Setup environment
cp .env.production.template .env
# Edit .env with your local configuration

# 3. Install dependencies
npm install                    # Root dependencies
cd makrcave-backend && poetry install && cd ..
cd makrx-store-backend && poetry install && cd ..

# 4. Start development environment
docker-compose up -d postgres redis keycloak minio
npm run dev  # Starts all frontends and backends
```

### First Contribution
1. **Read the documentation** - Familiarize yourself with the architecture
2. **Explore the codebase** - Run the applications locally
3. **Pick a good first issue** - Look for issues labeled `good-first-issue`
4. **Ask questions** - Join our community channels for help

## 📋 Contribution Process

### 1. Issue Creation
Before starting work, create or comment on an issue:
- **Bug reports**: Use the bug report template
- **Feature requests**: Use the feature request template
- **Security issues**: Email security@makrx.org directly

### 2. Branch Naming
Use descriptive branch names following this pattern:
```bash
# Feature branches
feature/add-equipment-reservation-system
feature/implement-bom-export

# Bug fixes
fix/equipment-booking-timezone-issue
fix/inventory-deduction-calculation

# Documentation
docs/update-api-documentation
docs/add-deployment-guide

# Hotfixes
hotfix/critical-auth-vulnerability
```

### 3. Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes
# - Write code following our style guide
# - Add tests for new functionality
# - Update documentation as needed

# 3. Test your changes
npm run test           # Frontend tests
poetry run pytest     # Backend tests
npm run typecheck      # Type checking
npm run lint           # Code linting

# 4. Commit your changes
git add .
git commit -m "feat: add equipment reservation system"

# 5. Push and create PR
git push origin feature/your-feature-name
# Create pull request through GitHub UI
```

## 📝 Coding Standards

### Git Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Types
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Maintenance tasks

# Examples
feat(auth): add multi-factor authentication
fix(api): resolve equipment booking conflict issue
docs(readme): update installation instructions
style(frontend): fix eslint warnings
refactor(database): optimize inventory queries
test(equipment): add reservation conflict tests
chore(deps): update dependencies to latest versions
```

### Code Style Guidelines

#### TypeScript/JavaScript
```typescript
// Use TypeScript for all new code
interface EquipmentReservation {
  id: string;
  equipmentId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
}

// Prefer functional components with hooks
function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const [isBooking, setIsBooking] = useState(false);
  
  const handleReservation = useCallback(async () => {
    setIsBooking(true);
    try {
      await reserveEquipment(equipment.id);
      toast.success('Equipment reserved successfully');
    } catch (error) {
      toast.error('Failed to reserve equipment');
    } finally {
      setIsBooking(false);
    }
  }, [equipment.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{equipment.name}</CardTitle>
        <CardDescription>{equipment.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleReservation} disabled={isBooking}>
          {isBooking ? 'Reserving...' : 'Reserve Equipment'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Python/FastAPI
```python
# Use type hints for all functions
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()

class EquipmentCreate(BaseModel):
    name: str
    type: EquipmentType
    location: Optional[str] = None
    hourly_rate: Optional[float] = None

@router.post("/equipment", response_model=EquipmentResponse)
async def create_equipment(
    equipment_data: EquipmentCreate,
    makerspace_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> EquipmentResponse:
    """Create new equipment in makerspace."""
    
    # Check permissions
    if not has_permission(current_user, "equipment.create", makerspace_id):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions to create equipment"
        )
    
    # Create equipment
    equipment = crud.equipment.create(
        db=db,
        obj_in=equipment_data,
        makerspace_id=makerspace_id
    )
    
    return equipment
```

### Component Structure
```
components/
├── equipment/              # Feature-based organization
│   ├── EquipmentCard.tsx
│   ├── EquipmentList.tsx
│   ├── ReservationModal.tsx
│   └── index.ts           # Export all components
├── ui/                    # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
└── layout/                # Layout components
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

## 🧪 Testing Requirements

### Frontend Testing
```typescript
// Unit tests with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EquipmentCard } from './EquipmentCard';

const mockEquipment = {
  id: '1',
  name: 'Ultimaker S3',
  type: '3d_printer',
  status: 'available'
};

test('should allow reservation of available equipment', async () => {
  const onReserve = jest.fn();
  
  render(
    <EquipmentCard equipment={mockEquipment} onReserve={onReserve} />
  );
  
  const reserveButton = screen.getByRole('button', { name: /reserve/i });
  fireEvent.click(reserveButton);
  
  await waitFor(() => {
    expect(onReserve).toHaveBeenCalledWith(mockEquipment.id);
  });
});

// Integration tests
test('should display equipment list from API', async () => {
  // Mock API response
  const mockEquipment = [mockEquipment];
  jest.mocked(api.getEquipment).mockResolvedValue(mockEquipment);
  
  render(<EquipmentList makerspaceId="123" />);
  
  await waitFor(() => {
    expect(screen.getByText('Ultimaker S3')).toBeInTheDocument();
  });
});
```

### Backend Testing
```python
# Unit tests with pytest
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock

def test_create_equipment_success(client: TestClient, auth_headers: dict):
    """Test successful equipment creation."""
    equipment_data = {
        "name": "Test Printer",
        "type": "3d_printer",
        "location": "Room A"
    }
    
    response = client.post(
        "/api/v1/makerspaces/123/equipment",
        json=equipment_data,
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == equipment_data["name"]
    assert data["type"] == equipment_data["type"]

def test_create_equipment_unauthorized(client: TestClient):
    """Test equipment creation without proper permissions."""
    equipment_data = {"name": "Test Printer", "type": "3d_printer"}
    
    response = client.post(
        "/api/v1/makerspaces/123/equipment",
        json=equipment_data
    )
    
    assert response.status_code == 401

# Database tests
def test_equipment_crud_operations(db_session):
    """Test equipment CRUD operations."""
    equipment_data = EquipmentCreate(
        name="Test Printer",
        type="3d_printer"
    )
    
    # Create
    equipment = crud.equipment.create(
        db=db_session,
        obj_in=equipment_data,
        makerspace_id="123"
    )
    assert equipment.name == equipment_data.name
    
    # Read
    retrieved = crud.equipment.get(db=db_session, id=equipment.id)
    assert retrieved.id == equipment.id
    
    # Update
    update_data = {"name": "Updated Printer"}
    updated = crud.equipment.update(
        db=db_session,
        db_obj=equipment,
        obj_in=update_data
    )
    assert updated.name == "Updated Printer"
    
    # Delete
    crud.equipment.remove(db=db_session, id=equipment.id)
    deleted = crud.equipment.get(db=db_session, id=equipment.id)
    assert deleted is None
```

### Test Coverage Requirements
- **Minimum coverage**: 80% for new code
- **Critical paths**: 95% coverage for authentication, payments, data handling
- **Integration tests**: All API endpoints must have integration tests
- **E2E tests**: Core user journeys must have end-to-end tests

## 🚀 Feature Flags

### Using Feature Flags
When developing new features, use feature flags to enable gradual rollouts:

```typescript
// Frontend feature flag usage
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

function NewFeatureComponent() {
  const isEnabled = useFeatureFlag('equipment.advanced_booking');
  
  if (!isEnabled) {
    return <LegacyBookingComponent />;
  }
  
  return <AdvancedBookingComponent />;
}
```

```python
# Backend feature flag usage
from dependencies import get_feature_flags

@router.get("/equipment/advanced")
async def get_advanced_equipment_data(
    feature_flags: dict = Depends(get_feature_flags)
):
    if not feature_flags.get("equipment.advanced_booking", False):
        raise HTTPException(status_code=404, detail="Feature not available")
    
    # Advanced feature implementation
    return advanced_equipment_data()
```

### Feature Flag Naming Convention
```
domain.feature.variant

Examples:
- equipment.advanced_booking.enabled
- inventory.auto_reorder.enabled
- billing.subscription_plans.v2
- analytics.real_time_dashboard.beta
```

## 📚 Documentation Requirements

### Code Documentation
```typescript
/**
 * Reserves equipment for a specified time period.
 * 
 * @param equipmentId - Unique identifier for the equipment
 * @param startTime - Reservation start time
 * @param endTime - Reservation end time
 * @param projectId - Optional project to associate with reservation
 * @returns Promise resolving to reservation details
 * @throws {Error} When equipment is not available or user lacks permissions
 * 
 * @example
 * ```typescript
 * const reservation = await reserveEquipment(
 *   'equipment-123',
 *   new Date('2024-01-15T14:00:00Z'),
 *   new Date('2024-01-15T16:00:00Z'),
 *   'project-456'
 * );
 * ```
 */
async function reserveEquipment(
  equipmentId: string,
  startTime: Date,
  endTime: Date,
  projectId?: string
): Promise<Reservation> {
  // Implementation...
}
```

### API Documentation
All API endpoints must include:
- Clear description of purpose
- Request/response schemas
- Authentication requirements
- Permission requirements
- Example requests and responses
- Error response codes and meanings

### README Updates
When adding new features:
- Update relevant README files
- Add feature to main documentation
- Include setup instructions for new dependencies
- Document any breaking changes

## 🔍 Code Review Process

### Pull Request Requirements
Before submitting a PR, ensure:
- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Feature flags are used for new features
- [ ] Security considerations are addressed
- [ ] Performance impact is considered

### PR Description Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Feature flag configured

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
```

### Review Criteria
Reviewers will check for:
- **Functionality**: Does the code solve the intended problem?
- **Quality**: Is the code well-structured and maintainable?
- **Security**: Are there any security vulnerabilities?
- **Performance**: Will this impact system performance?
- **Testing**: Is the code adequately tested?
- **Documentation**: Is the change properly documented?

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Device: [e.g. iPhone X, Desktop]

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.

**User Stories**
- As a [role], I want [feature] so that [benefit]
- As a [role], I want [feature] so that [benefit]
```

## 🎯 Community Guidelines

### Communication
- **Be respectful**: Treat all community members with respect
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone has different experience levels
- **Be inclusive**: Welcome newcomers and help them get started

### Getting Help
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: For real-time discussion and questions
- **Documentation**: Check docs first before asking questions
- **Email**: security@makrx.org for security-related issues

### Recognition
We recognize contributors through:
- **Contributor list**: Added to project contributors
- **Release notes**: Significant contributions mentioned in releases
- **Special recognition**: Outstanding contributions highlighted in community

## 📄 License

By contributing to MakrX, you agree that your contributions will be licensed under the same license as the project. Make sure you have the right to contribute any code you submit.

## 🚀 Getting Started Checklist

For new contributors:
- [ ] Read this contributing guide
- [ ] Set up development environment
- [ ] Join our community channels
- [ ] Read the architecture documentation
- [ ] Pick a `good-first-issue` to work on
- [ ] Submit your first pull request

---

Thank you for contributing to MakrX! Together, we're building the future of maker communities. 🛠️
