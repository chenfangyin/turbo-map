import { PluginManager, TurboMapPlugin } from '../../src/turboMap/plugins/PluginManager';

describe('PluginManager', () => {
  let pluginManager: PluginManager<string, any>;

  beforeEach(() => {
    pluginManager = new PluginManager<string, any>();
  });

  describe('Plugin Registration', () => {
    test('should add a plugin', async () => {
      const plugin: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        version: '1.0.0',
        beforeSet: jest.fn(),
        afterSet: jest.fn(),
        beforeGet: jest.fn(),
        afterGet: jest.fn()
      };

      const result = await pluginManager.addPlugin(plugin);
      
      expect(result).toBe(true);
      expect(pluginManager.getPlugin('test-plugin')).toBe(plugin);
    });

    test('should handle duplicate plugin registration', async () => {
      const plugin1: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        version: '1.0.0',
        beforeSet: jest.fn()
      };

      const plugin2: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        version: '2.0.0',
        beforeSet: jest.fn()
      };

      await pluginManager.addPlugin(plugin1);
      const result = await pluginManager.addPlugin(plugin2);

      expect(result).toBe(true);
      // Should keep the latest version
      expect(pluginManager.getPlugin('test-plugin')).toBe(plugin2);
    });

    test('should remove a plugin', async () => {
      const plugin: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        version: '1.0.0',
        beforeSet: jest.fn()
      };

      await pluginManager.addPlugin(plugin);
      const removeResult = await pluginManager.removePlugin('test-plugin');
      
      expect(removeResult).toBe(true);
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });

    test('should enable and disable plugins', async () => {
      const plugin: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        version: '1.0.0',
        beforeSet: jest.fn()
      };

      await pluginManager.addPlugin(plugin);
      
      const enableResult = await pluginManager.enablePlugin('test-plugin');
      expect(enableResult).toBe(true);
      
      const disableResult = await pluginManager.disablePlugin('test-plugin');
      expect(disableResult).toBe(true);
    });
  });

  describe('Plugin Execution', () => {
    test('should execute before hooks', () => {
      const plugin: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        beforeSet: jest.fn().mockReturnValue({ key: 'modified-key', value: 'modified-value' }),
        beforeGet: jest.fn().mockReturnValue('modified-key')
      };

      pluginManager.addPlugin(plugin);

      const context = {
        operation: 'set',
        key: 'test-key',
        value: 'test-value',
        timestamp: Date.now()
      };

      const result = pluginManager.executeBefore('beforeSet', context, 'test-key', 'test-value');
      
      expect(result).toEqual({ key: 'modified-key', value: 'modified-value' });
      expect(plugin.beforeSet).toHaveBeenCalledWith('test-key', 'test-value');
    });

    test('should execute after hooks', () => {
      const plugin: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        afterSet: jest.fn(),
        afterGet: jest.fn()
      };

      pluginManager.addPlugin(plugin);

      const context = {
        operation: 'set',
        key: 'test-key',
        value: 'test-value',
        timestamp: Date.now()
      };

      pluginManager.executeAfter('afterSet', context, 'test-key', 'test-value');
      
      expect(plugin.afterSet).toHaveBeenCalledWith('test-key', 'test-value');
    });

    test('should handle multiple plugins', () => {
      const plugin1: TurboMapPlugin<string, any> = {
        name: 'plugin1',
        beforeSet: jest.fn().mockReturnValue({ key: 'key1', value: 'value1' })
      };

      const plugin2: TurboMapPlugin<string, any> = {
        name: 'plugin2',
        beforeSet: jest.fn().mockReturnValue({ key: 'key2', value: 'value2' })
      };

      pluginManager.addPlugin(plugin1);
      pluginManager.addPlugin(plugin2);

      const context = {
        operation: 'set',
        key: 'test-key',
        value: 'test-value',
        timestamp: Date.now()
      };

      const result = pluginManager.executeBefore('beforeSet', context, 'test-key', 'test-value');
      
      // Should return result from the last plugin
      expect(result).toEqual({ key: 'key2', value: 'value2' });
      expect(plugin1.beforeSet).toHaveBeenCalled();
      expect(plugin2.beforeSet).toHaveBeenCalled();
    });
  });

  describe('Plugin Statistics', () => {
    test('should provide plugin statistics', () => {
      const plugin: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        beforeSet: jest.fn()
      };

      pluginManager.addPlugin(plugin);

      const stats = pluginManager.getStatus();
      
      expect(stats).toBeDefined();
      expect(stats.totalPlugins).toBe(1);
      expect(stats.enabledPlugins).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle plugin errors gracefully', () => {
      const plugin: TurboMapPlugin<string, any> = {
        name: 'error-plugin',
        beforeSet: jest.fn().mockImplementation(() => {
          throw new Error('Plugin error');
        })
      };

      pluginManager.addPlugin(plugin);

      const context = {
        operation: 'set',
        key: 'test-key',
        value: 'test-value',
        timestamp: Date.now()
      };

      // Should not crash the system
      expect(() => {
        pluginManager.executeBefore('beforeSet', context, 'test-key', 'test-value');
      }).not.toThrow();
    });

    test('should isolate plugin errors', () => {
      const errorPlugin: TurboMapPlugin<string, any> = {
        name: 'error-plugin',
        beforeSet: jest.fn().mockImplementation(() => {
          throw new Error('Plugin error');
        })
      };

      const workingPlugin: TurboMapPlugin<string, any> = {
        name: 'working-plugin',
        beforeSet: jest.fn().mockReturnValue({ key: 'working-key', value: 'working-value' })
      };

      pluginManager.addPlugin(errorPlugin);
      pluginManager.addPlugin(workingPlugin);

      const context = {
        operation: 'set',
        key: 'test-key',
        value: 'test-value',
        timestamp: Date.now()
      };

      const result = pluginManager.executeBefore('beforeSet', context, 'test-key', 'test-value');
      
      // Should return result from working plugin
      expect(result).toEqual({ key: 'working-key', value: 'working-value' });
      expect(workingPlugin.beforeSet).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    test('should handle many plugins efficiently', () => {
      const plugins: TurboMapPlugin<string, any>[] = [];
      
      for (let i = 0; i < 10; i++) {
        plugins.push({
          name: `plugin${i}`,
          beforeSet: jest.fn()
        });
      }

      const startTime = Date.now();
      plugins.forEach(plugin => pluginManager.addPlugin(plugin));
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle concurrent plugin operations', () => {
      const plugin: TurboMapPlugin<string, any> = {
        name: 'test-plugin',
        beforeSet: jest.fn().mockReturnValue({ key: 'data', value: 'data' })
      };

      pluginManager.addPlugin(plugin);

      const results: any[] = [];
      for (let i = 0; i < 10; i++) {
        const context = {
          operation: 'set',
          key: `key${i}`,
          value: `value${i}`,
          timestamp: Date.now()
        };
        results.push(pluginManager.executeBefore('beforeSet', context, `key${i}`, `value${i}`));
      }
      
      expect(results).toHaveLength(10);
      expect(results.every((result: any) => result !== null)).toBe(true);
    });
  });
}); 
