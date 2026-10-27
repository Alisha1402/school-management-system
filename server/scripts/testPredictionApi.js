require('dotenv').config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://localhost:5000/api';

const runPredictionApiTests = async () => {
  console.log('================================================================');
  console.log('TESTING AI PERFORMANCE PREDICTION BACKEND API INTEGRATION');
  console.log('================================================================\n');

  try {
    // 1. Authenticate as Student
    console.log('[1/6] Authenticating as Student (student@school.com)...');
    const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@school.com', password: 'student123' }),
    });
    const studentAuth = await studentLogin.json();
    const studentToken = studentAuth.token;
    const studentHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    };
    console.log(`   [OK] Student Authenticated: ${studentAuth.user?.name} (Role: ${studentAuth.user?.role})`);

    // 2. Fetch Personal Prediction
    console.log('\n[2/6] Testing GET /api/predictions/my-prediction...');
    const myPredRes = await fetch(`${BASE_URL}/predictions/my-prediction`, { headers: studentHeaders });
    assert(myPredRes.status === 200, `Expected 200, got ${myPredRes.status}`);
    const myPredData = await myPredRes.json();
    assert(myPredData.success === true, 'Response success must be true');
    assert(myPredData.prediction !== undefined, 'Prediction must be present');
    console.log(`   * Student: ${myPredData.student.name} (${myPredData.student.className})`);
    console.log(`   * Predicted Annual Percentage: ${myPredData.prediction.prediction.predictedFinalPercentage}%`);
    console.log(`   * Predicted CBSE Grade: ${myPredData.prediction.prediction.predictedCbseGrade}`);
    console.log(`   * Risk Level: ${myPredData.prediction.prediction.riskLevel} (Score: ${myPredData.prediction.prediction.riskScore})`);
    console.log(`   * Model Version: ${myPredData.prediction.modelVersion}`);
    console.log(`   * Interventions Generated: ${myPredData.prediction.evidenceBasedInterventions.length}`);
    console.log('   [OK] Student Personal AI Prediction Retrieved & Validated');

    // 3. Authenticate as Teacher
    console.log('\n[3/6] Authenticating as Teacher (teacher@school.com)...');
    const teacherLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@school.com', password: 'teacher123' }),
    });
    const teacherAuth = await teacherLogin.json();
    const teacherToken = teacherAuth.token;
    const teacherHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${teacherToken}`,
    };
    console.log(`   [OK] Teacher Authenticated: ${teacherAuth.user?.name} (Role: ${teacherAuth.user?.role})`);

    // 4. Fetch Class Risk Matrix (Faculty / Admin Early Warning System)
    console.log('\n[4/6] Testing GET /api/predictions/class-risk-matrix (Class 10)...');
    const matrixRes = await fetch(`${BASE_URL}/predictions/class-risk-matrix?className=Class 10`, {
      headers: teacherHeaders,
    });
    assert(matrixRes.status === 200, `Expected 200, got ${matrixRes.status}`);
    const matrixData = await matrixRes.json();
    assert(matrixData.success === true);
    console.log(`   * Total Students in Matrix: ${matrixData.summary.totalStudents}`);
    console.log(`   * Average Predicted Score: ${matrixData.summary.averagePredictedScore}%`);
    console.log(`   * Projected Pass Rate: ${matrixData.summary.projectedPassRate}%`);
    console.log(`   * Risk Distribution: ${matrixData.summary.lowRiskCount} Low, ${matrixData.summary.moderateRiskCount} Moderate, ${matrixData.summary.highRiskCount} High`);
    console.log('   [OK] Class Risk Matrix & Early Warning System Validated');

    // 5. Fetch Model Telemetry
    console.log('\n[5/6] Testing GET /api/predictions/model-telemetry...');
    const telemetryRes = await fetch(`${BASE_URL}/predictions/model-telemetry`, {
      headers: teacherHeaders,
    });
    assert(telemetryRes.status === 200);
    const telemetryData = await telemetryRes.json();
    console.log(`   * Algorithm: ${telemetryData.telemetry.algorithm}`);
    console.log(`   * Benchmark R2 Score: ${telemetryData.telemetry.metrics.test_r2}`);
    console.log(`   * Mean Absolute Error: ${telemetryData.telemetry.metrics.test_mae}%`);
    console.log('   [OK] Model Telemetry Endpoint Validated');

    // 6. Security and RBAC Enforcement Check
    console.log('\n[6/6] Testing Role-Based Authorization Enforcement...');
    // Student attempting teacher-only risk matrix
    const unauthMatrixRes = await fetch(`${BASE_URL}/predictions/class-risk-matrix`, {
      headers: studentHeaders,
    });
    assert(unauthMatrixRes.status === 403, `Expected 403 Forbidden, got ${unauthMatrixRes.status}`);
    console.log(`   * Student access to Class Risk Matrix blocked: Status ${unauthMatrixRes.status} Forbidden`);

    // Unauthenticated request
    const noAuthRes = await fetch(`${BASE_URL}/predictions/my-prediction`);
    assert(noAuthRes.status === 401, `Expected 401 Unauthorized, got ${noAuthRes.status}`);
    console.log(`   * Unauthenticated request blocked: Status ${noAuthRes.status} Unauthorized`);

    console.log('\n================================================================');
    console.log('ALL 6 AI PREDICTION API INTEGRATION TESTS PASSED (100% SUCCESS)');
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  }
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

runPredictionApiTests();
