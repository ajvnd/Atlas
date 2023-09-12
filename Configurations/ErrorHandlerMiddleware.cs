using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using MySqlConnector;
using Atlas.Exceptions;

namespace Atlas.Configurations;

public class ErrorHandlerMiddleware
{
    public static void Use(WebApplication app)
    {
        app.UseExceptionHandler(appError =>
        {
            appError.Run(async context =>
            {
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                var contextFeature = context.Features.Get<IExceptionHandlerFeature>();

                if (contextFeature?.Error.InnerException is MySqlException
                    {
                        ErrorCode: MySqlErrorCode.RowIsReferenced2
                    })
                {
                    await context.Response.WriteAsync("درحال حاضر بدلیل استفاده این داده، امکان حذف وجود ندارد");
                }

                switch (contextFeature?.Error)
                {
                    case DuplicateUserNameException:
                        await context.Response.WriteAsync("این نام کاربری قبلا استفاده شده است");
                        break;
                    case UnAllowedToDeleteException:
                        await context.Response.WriteAsync("به دلیل زیرساختی بودن داده، امکان حذف آن وجود ندارد.");
                        break;
                    case UnAllowedToEditException:
                        await context.Response.WriteAsync("به دلیل زیر ساختی بودن داده، امکان ویرایش آن وجود ندارد.");
                        break;
                }
            });
        });
    }
}