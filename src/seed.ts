import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import { User } from './modules/user/user.model';
import { Project } from './modules/project/project.model';
import { Sprint } from './modules/sprint/sprint.model';
import { Task } from './modules/task/task.model';
import {
  USER_ROLES,
  PROJECT_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  SPRINT_STATUS,
} from './shared/constants';

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/mpms';

const seedDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.info('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Sprint.deleteMany({}),
      Task.deleteMany({}),
    ]);
    console.info('Cleared existing data');

    // Create users - use plain password, the model's pre-save hook will hash it
    const plainPassword = 'Password123';

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@mpms.com',
      password: plainPassword,
      role: USER_ROLES.ADMIN,
      department: 'Management',
      skills: ['Leadership', 'Project Management'],
      isEmailVerified: true,
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@mpms.com',
      password: plainPassword,
      role: USER_ROLES.MANAGER,
      department: 'Engineering',
      skills: ['Agile', 'Scrum', 'Technical Leadership'],
      isEmailVerified: true,
    });

    const member1 = await User.create({
      name: 'John Developer',
      email: 'john@mpms.com',
      password: plainPassword,
      role: USER_ROLES.MEMBER,
      department: 'Engineering',
      skills: ['React', 'Node.js', 'TypeScript'],
      isEmailVerified: true,
    });

    const member2 = await User.create({
      name: 'Jane Designer',
      email: 'jane@mpms.com',
      password: plainPassword,
      role: USER_ROLES.MEMBER,
      department: 'Design',
      skills: ['UI/UX', 'Figma', 'Adobe XD'],
      isEmailVerified: true,
    });

    console.info('Created users');

    // Create projects
    const project1 = await Project.create({
      title: 'E-Commerce Platform',
      client: 'TechCorp Inc.',
      description: 'A modern e-commerce platform with advanced features',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      budget: 150000,
      status: PROJECT_STATUS.ACTIVE,
      createdBy: admin._id,
      teamMembers: [member1._id, member2._id],
      managers: [manager._id],
    });

    await Project.create({
      title: 'Mobile Banking App',
      client: 'Finance Plus',
      description: 'Secure mobile banking application for iOS and Android',
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-08-15'),
      budget: 200000,
      status: PROJECT_STATUS.ACTIVE,
      createdBy: manager._id,
      teamMembers: [member1._id],
      managers: [manager._id],
    });

    await Project.create({
      title: 'CRM System',
      client: 'Sales Pro Ltd.',
      description: 'Customer relationship management system',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      budget: 120000,
      status: PROJECT_STATUS.PLANNED,
      createdBy: admin._id,
      teamMembers: [member2._id],
      managers: [manager._id],
    });

    console.info('Created projects');

    // Create sprints for project1
    const sprint1 = await Sprint.create({
      title: 'Foundation Sprint',
      sprintNumber: 1,
      project: project1._id,
      description: 'Set up project foundation and core infrastructure',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-14'),
      status: SPRINT_STATUS.COMPLETED,
      goals: ['Project setup', 'Database design', 'Authentication'],
    });

    const sprint2 = await Sprint.create({
      title: 'User Management Sprint',
      sprintNumber: 2,
      project: project1._id,
      description: 'Implement user management features',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-28'),
      status: SPRINT_STATUS.ACTIVE,
      goals: ['User registration', 'Profile management', 'Role-based access'],
    });

    const sprint3 = await Sprint.create({
      title: 'Product Catalog Sprint',
      sprintNumber: 3,
      project: project1._id,
      description: 'Build product catalog and search features',
      startDate: new Date('2024-01-29'),
      endDate: new Date('2024-02-11'),
      status: SPRINT_STATUS.PLANNED,
      goals: ['Product CRUD', 'Search functionality', 'Filtering'],
    });

    console.info('Created sprints');

    // Create tasks for sprint1 (completed)
    await Task.create({
      title: 'Set up project repository',
      description: 'Initialize Git repository with proper structure',
      project: project1._id,
      sprint: sprint1._id,
      assignees: [member1._id],
      createdBy: manager._id,
      estimate: 2,
      timeLogged: 2,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.DONE,
      dueDate: new Date('2024-01-03'),
      completedAt: new Date('2024-01-02'),
    });

    await Task.create({
      title: 'Design database schema',
      description: 'Create MongoDB schema for all entities',
      project: project1._id,
      sprint: sprint1._id,
      assignees: [member1._id],
      createdBy: manager._id,
      estimate: 8,
      timeLogged: 10,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.DONE,
      dueDate: new Date('2024-01-07'),
      completedAt: new Date('2024-01-06'),
    });

    await Task.create({
      title: 'Implement authentication',
      description: 'JWT-based authentication with refresh tokens',
      project: project1._id,
      sprint: sprint1._id,
      assignees: [member1._id],
      createdBy: manager._id,
      estimate: 16,
      timeLogged: 18,
      priority: TASK_PRIORITY.URGENT,
      status: TASK_STATUS.DONE,
      dueDate: new Date('2024-01-12'),
      completedAt: new Date('2024-01-11'),
    });

    // Create tasks for sprint2 (active)
    await Task.create({
      title: 'User registration API',
      description: 'Implement user registration endpoint with validation',
      project: project1._id,
      sprint: sprint2._id,
      assignees: [member1._id],
      createdBy: manager._id,
      estimate: 8,
      timeLogged: 6,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      dueDate: new Date('2024-01-20'),
      subtasks: [
        { title: 'Create validation schema', isCompleted: true },
        { title: 'Implement controller', isCompleted: true },
        { title: 'Add email verification', isCompleted: false },
      ],
    });

    await Task.create({
      title: 'User profile page UI',
      description: 'Design and implement user profile page',
      project: project1._id,
      sprint: sprint2._id,
      assignees: [member2._id],
      createdBy: manager._id,
      estimate: 12,
      timeLogged: 4,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.IN_PROGRESS,
      dueDate: new Date('2024-01-22'),
    });

    await Task.create({
      title: 'Role-based access control',
      description: 'Implement RBAC middleware and permissions',
      project: project1._id,
      sprint: sprint2._id,
      assignees: [member1._id],
      createdBy: manager._id,
      estimate: 10,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.TODO,
      dueDate: new Date('2024-01-25'),
      requiresReview: true,
    });

    await Task.create({
      title: 'Password reset flow',
      description: 'Implement forgot password and reset functionality',
      project: project1._id,
      sprint: sprint2._id,
      assignees: [member1._id],
      createdBy: manager._id,
      estimate: 6,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      dueDate: new Date('2024-01-27'),
    });

    // Create tasks for sprint3 (planned)
    await Task.create({
      title: 'Product CRUD API',
      description: 'Create, read, update, delete operations for products',
      project: project1._id,
      sprint: sprint3._id,
      assignees: [member1._id],
      createdBy: manager._id,
      estimate: 16,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.TODO,
      dueDate: new Date('2024-02-05'),
    });

    await Task.create({
      title: 'Product listing page',
      description: 'Implement product listing with pagination',
      project: project1._id,
      sprint: sprint3._id,
      assignees: [member2._id],
      createdBy: manager._id,
      estimate: 12,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      dueDate: new Date('2024-02-08'),
    });

    // Create tasks without sprint (backlog)
    await Task.create({
      title: 'Shopping cart implementation',
      description: 'Full shopping cart functionality',
      project: project1._id,
      assignees: [],
      createdBy: manager._id,
      estimate: 20,
      priority: TASK_PRIORITY.LOW,
      status: TASK_STATUS.TODO,
    });

    await Task.create({
      title: 'Payment integration',
      description: 'Integrate Stripe payment gateway',
      project: project1._id,
      assignees: [],
      createdBy: manager._id,
      estimate: 24,
      priority: TASK_PRIORITY.LOW,
      status: TASK_STATUS.TODO,
    });

    console.info('Created tasks');

    console.info(`
✅ Database seeded successfully!

📧 Test Credentials:
   Admin:   admin@mpms.com / Password123
   Manager: manager@mpms.com / Password123
   Member:  john@mpms.com / Password123
   Member:  jane@mpms.com / Password123
    `);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
