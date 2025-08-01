import { DiagnosticAnalyzer, PerformanceMonitor, MemoryAnalyzer } from '../../src/turboMap/utils/DiagnosticUtils';

describe('DiagnosticUtils', () => {
  let diagnosticAnalyzer: DiagnosticAnalyzer;
  let performanceMonitor: PerformanceMonitor;
  let memoryAnalyzer: MemoryAnalyzer;

  beforeEach(() => {
    diagnosticAnalyzer = new DiagnosticAnalyzer();
    performanceMonitor = new PerformanceMonitor();
    memoryAnalyzer = new MemoryAnalyzer();
  });

  describe('PerformanceMonitor', () => {
    test('should track operations', () => {
      performanceMonitor.trackOperation('test', 100);
      performanceMonitor.trackOperation('test', 200);
      
      const profile = performanceMonitor.getProfile();
      expect(profile.operations.test).toBeDefined();
      expect(profile.operations.test.count).toBe(2);
      expect(profile.operations.test.averageTime).toBe(150);
    });

    test('should identify hotspots', () => {
      performanceMonitor.trackOperation('slow', 1000);
      performanceMonitor.trackOperation('fast', 10);
      performanceMonitor.trackOperation('slow', 1100);
      
      const profile = performanceMonitor.getProfile();
      expect(profile.hotspots).toBeDefined();
      expect(profile.hotspots.length).toBeGreaterThan(0);
      
      const slowHotspot = profile.hotspots.find(h => h.operation === 'slow');
      expect(slowHotspot).toBeDefined();
      expect(slowHotspot!.averageTime).toBeGreaterThan(1000);
    });

    test('should track trends', () => {
      performanceMonitor.trackOperation('test', 100);
      performanceMonitor.trackOperation('test', 200);
      
      const profile = performanceMonitor.getProfile();
      expect(profile.trends).toBeDefined();
      expect(profile.trends.length).toBeGreaterThan(0);
    });
  });

  describe('MemoryAnalyzer', () => {
    test('should analyze map memory usage', () => {
      const map = new Map<string, any>();
      map.set('key1', { data: 'value1' });
      map.set('key2', { data: 'value2' });
      
      const analysis = memoryAnalyzer.analyzeMap(map);
      
      expect(analysis.heapUsed).toBeGreaterThan(0);
      expect(analysis.heapTotal).toBeGreaterThan(0);
      expect(analysis.estimatedMapSize).toBeGreaterThan(0);
      expect(analysis.keyDistribution).toBeDefined();
    });

    test('should identify largest keys', () => {
      const map = new Map<string, any>();
      map.set('small', 'small value');
      map.set('large', { data: new Array(1000).fill('large value') });
      
      const analysis = memoryAnalyzer.analyzeMap(map);
      
      expect(analysis.largestKeys).toBeDefined();
      expect(analysis.largestKeys.length).toBeGreaterThan(0);
      
      const largeKey = analysis.largestKeys.find(k => k.key.includes('large'));
      expect(largeKey).toBeDefined();
      expect(largeKey!.size).toBeGreaterThan(0);
    });

    test('should track memory trends', () => {
      const map = new Map<string, any>();
      map.set('key1', 'value1');
      
      const analysis1 = memoryAnalyzer.analyzeMap(map);
      map.set('key2', 'value2');
      const analysis2 = memoryAnalyzer.analyzeMap(map);
      
      expect(analysis1.memoryTrend).toBeDefined();
      expect(analysis2.memoryTrend).toBeDefined();
      expect(analysis2.memoryTrend.length).toBeGreaterThan(analysis1.memoryTrend.length);
    });
  });

  describe('DiagnosticAnalyzer', () => {
    test('should generate complete diagnostic report', () => {
      const map = new Map<string, any>();
      map.set('test', 'value');
      
      const report = diagnosticAnalyzer.generateReport(map);
      
      expect(report).toBeDefined();
      expect(report.performanceProfile).toBeDefined();
      expect(report.memoryUsage).toBeDefined();
      expect(report.errorAnalysis).toBeDefined();
      expect(report.optimizationSuggestions).toBeDefined();
      expect(report.healthScore).toBeGreaterThanOrEqual(0);
      expect(report.healthScore).toBeLessThanOrEqual(100);
      expect(report.recommendations).toBeDefined();
    });

    test('should track operations', () => {
      diagnosticAnalyzer.trackOperation('test', 100);
      
      const map = new Map<string, any>();
      const report = diagnosticAnalyzer.generateReport(map);
      
      expect(report.performanceProfile.operations.test).toBeDefined();
      expect(report.performanceProfile.operations.test.count).toBe(1);
    });

    test('should generate optimization suggestions', () => {
      const map = new Map<string, any>();
      const report = diagnosticAnalyzer.generateReport(map);
      
      expect(report.optimizationSuggestions).toBeDefined();
      expect(Array.isArray(report.optimizationSuggestions)).toBe(true);
    });

    test('should calculate health score', () => {
      const map = new Map<string, any>();
      const report = diagnosticAnalyzer.generateReport(map);
      
      expect(report.healthScore).toBeGreaterThanOrEqual(0);
      expect(report.healthScore).toBeLessThanOrEqual(100);
    });

    test('should reset diagnostics', () => {
      diagnosticAnalyzer.trackOperation('test', 100);
      diagnosticAnalyzer.reset();
      
      const map = new Map<string, any>();
      const report = diagnosticAnalyzer.generateReport(map);
      
      expect(report.performanceProfile.operations.test).toBeUndefined();
    });
  });
}); 
