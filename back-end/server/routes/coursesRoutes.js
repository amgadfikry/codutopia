import { Router } from 'express';
import CoursesControl from '../controllers/coursesControl.js';
import MiddlewareControl from '../controllers/middlewareControl.js';

// Courses routes with the respective controller methods
const coursesRouter = Router();

// Get all courses route
coursesRouter.get('/all',
  CoursesControl.allCourses);

// Get Course by category route
coursesRouter.get('/category/:category',
  CoursesControl.coursesByCategory);

// Get course by id route
coursesRouter.get('/:id',
  [MiddlewareControl.authMiddleware, MiddlewareControl.userORInstructorMiddleware],
  CoursesControl.coursesById);

// // Get Course by instructor id route
// coursesRouter.get('/instructor/:id',
//   [MiddlewareControl.authMiddleware, MiddlewareControl.userORInstructorMiddleware],
//   CoursesControl.coursesByInstructorId);


// // Get all enrolled courses route
// coursesRouter.get('/enrolled/all',
//   [MiddlewareControl.authMiddleware, MiddlewareControl.userRoleMiddleware],
//   CoursesControl.enrolledCourses);

// // Create a new course route
// coursesRouter.post('/create',
//   [MiddlewareControl.authMiddleware, MiddlewareControl.instructorRoleMiddleware],
//   CoursesControl.createCourse);

// // Update a course route
// coursesRouter.put('/update/:id',
//   [MiddlewareControl.authMiddleware, MiddlewareControl.instructorRoleMiddleware],
//   CoursesControl.updateCourse);

// // Delete a course route
// coursesRouter.delete('/delete/:id',
//   [MiddlewareControl.authMiddleware, MiddlewareControl.instructorRoleMiddleware],
//   CoursesControl.deleteCourse);

// // Enroll in a course route
// coursesRouter.post('/enroll/:id',
//   [MiddlewareControl.authMiddleware, MiddlewareControl.userRoleMiddleware],
//   CoursesControl.enrollCourse);

// // Unenroll from a course route
// coursesRouter.delete('/unenroll/:id',
//   [MiddlewareControl.authMiddleware, MiddlewareControl.userRoleMiddleware],
//   CoursesControl.unenrollCourse);

// // Rate a course route
// coursesRouter.post('/rate/:id',
//   [MiddlewareControl.authMiddleware, MiddlewareControl.userRoleMiddleware],
//   CoursesControl.rateCourse);


// Export the coursesRouter
export default coursesRouter;
