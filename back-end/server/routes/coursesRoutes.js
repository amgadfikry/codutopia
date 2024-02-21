import { Router } from 'express';
import CoursesControl from '../controllers/coursesControl.js';
import MiddlewareControl from '../controllers/middlewareControl.js';

// Courses routes with the respective controller methods
const coursesRouter = Router();

// Get all courses route
coursesRouter.get('/all',
  CoursesControl.allCourses);

// get course navigation route
coursesRouter.get('/page/:page/limit/:limit',
  CoursesControl.coursePagination);

// Get Course by search criteria route
coursesRouter.post('/search/',
  CoursesControl.coursesBySearch);

// get Course by search criteria pagination route
coursesRouter.post('/search/page/:page/limit/:limit',
  CoursesControl.coursesBySearchPagination);

// Get course by id route
coursesRouter.get('/:id',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['user', 'instructor'])],
  CoursesControl.coursesById);

// Get Course by instructor id route
coursesRouter.get('/instructor/:id',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor', 'user'])],
  CoursesControl.coursesByInstructorId);

// Get all enrolled courses route
coursesRouter.get('/enrolled/all',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['user'])],
  CoursesControl.enrolledCourses);

// Create a new course route
coursesRouter.post('/create',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor'])],
  CoursesControl.createCourse);

// Update a course route
coursesRouter.put('/update/:id',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor'])],
  CoursesControl.updateCourse);

// Delete a course route
coursesRouter.delete('/delete/:id',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor'])],
  CoursesControl.deleteCourse);

// Enroll in a course route
coursesRouter.post('/enroll/:id',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['user'])],
  CoursesControl.enrollCourse);

// Unenroll from a course route
coursesRouter.delete('/unenroll/:id',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['user'])],
  CoursesControl.unenrollCourse);

// Export the coursesRouter
export default coursesRouter;
