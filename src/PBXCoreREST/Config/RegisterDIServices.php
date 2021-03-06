<?php

declare(strict_types=1);
/**
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 5 2018
 *
 */

namespace MikoPBX\PBXCoreREST\Config;

use MikoPBX\Common\Providers\{BeanstalkConnectionCacheProvider,
    BeanstalkConnectionWorkerApiProvider,
    CDRDatabaseProvider,
    MainDatabaseProvider,
    ModelsCacheProvider,
    ModelsMetadataProvider,
    PBXConfModulesProvider,
    RegistryProvider,
    ManagedCacheProvider,
    SessionReadOnlyProvider};
use MikoPBX\PBXCoreREST\Providers\{
    DispatcherProvider,
    RequestProvider,
    ResponseProvider,
    RouterProvider};
use Phalcon\Di\DiInterface;

class RegisterDIServices
{
    /**
     * Initialize services on dependency injector
     *
     * @param \Phalcon\Di\DiInterface $di
     */
    public static function init(DiInterface $di): void
    {
        $pbxRestAPIProviders = [
            // Inject Registry provider
            RegistryProvider::class,

            // Inject Database connections
            ModelsMetadataProvider::class,
            MainDatabaseProvider::class,
            CDRDatabaseProvider::class,

            // Inject caches
            ManagedCacheProvider::class,
            ModelsCacheProvider::class,


            // Inject Queue connection
            BeanstalkConnectionWorkerApiProvider::class,
            BeanstalkConnectionCacheProvider::class,

            // Inject PBX modules
            PBXConfModulesProvider::class,

            // Inject REST API providers
            DispatcherProvider::class,
            ResponseProvider::class,
            RequestProvider::class,
            RouterProvider::class,
            SessionReadOnlyProvider::class,

        ];

        foreach ($pbxRestAPIProviders as $provider) {
            // Delete previous provider
            $di->remove($provider::SERVICE_NAME);
            $di->register(new $provider());
        }
    }
}